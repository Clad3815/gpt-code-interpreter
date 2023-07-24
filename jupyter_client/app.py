from werkzeug.utils import secure_filename, safe_join
from werkzeug.exceptions import NotFound
from flask import Flask, request, jsonify, send_file, send_from_directory
from jupyter_client import KernelManager
from nbformat.v4 import new_notebook, new_code_cell, output_from_msg
from nbformat import write
from queue import Empty

import os
import signal
import sys
import uuid
import json

app = Flask(__name__)

sessions = {}


@app.route('/session', methods=['POST'])
def create_session():
    # Get the kernel_name from the query parameters. If not provided, default to 'python3'.
    kernel_name = request.json.get('kernel_name', 'python3')
    
    km = KernelManager(kernel_name=kernel_name)
    km.start_kernel(cwd='/mnt/data')
    client = km.client()
    client.start_channels()

    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        'km': km,
        'client': client,
        'notebook': new_notebook(metadata={"language_info": {"name": kernel_name}})
    }

    return jsonify({'session_id': session_id}), 200


def truncate_output(output):
    MAX_OUTPUT_LENGTH = 3000  # or any other limit you prefer
    TRUNCATED_MSG = '\n...Output truncated...\n'
    if output['output_type'] == 'stream':
        if len(output['text']) > MAX_OUTPUT_LENGTH:
            half_len = MAX_OUTPUT_LENGTH // 2
            output['text'] = output['text'][:half_len] + TRUNCATED_MSG + output['text'][-half_len:]
    elif output['output_type'] in ['display_data', 'execute_result']:
        data = output['data']
        if 'image/png' in data or 'image/jpeg' in data:
            return output
        for mime_type, content in data.items():
            if isinstance(content, str) and len(content) > MAX_OUTPUT_LENGTH:
                half_len = MAX_OUTPUT_LENGTH // 2
                data[mime_type] = content[:half_len] + TRUNCATED_MSG + content[-half_len:]
    return output


@app.route('/file-download/<path:filepath>', methods=['GET'])
def download_file(filepath):
    try:
        # Get the absolute path to the directory of this script
        base_dir = "/mnt/data"
        # Get the absolute file path
        abs_filepath = os.path.join(base_dir, filepath)
        return send_file(abs_filepath, as_attachment=True)
    except NotFound:
        return jsonify({'error': 'File not found'}), 404


@app.route('/execute', methods=['POST'])
def execute():
    session_id = request.json.get('session_id')
    code = request.json.get('code')

    if session_id is None:
        return jsonify({'error': 'No session_id provided'})
    if code is None:
        return jsonify({'error': 'No code provided'})
    if session_id not in sessions:
        return jsonify({'error': 'Invalid session_id'})

    km = sessions[session_id]['km']
    client = sessions[session_id]['client']
    notebook = sessions[session_id]['notebook']

    # Check if the kernel is still running
    if not km.is_alive():
        del sessions[session_id]  # Remove the session from the sessions dictionary
        return jsonify({'error': 'Session invalidated due to Jupyter server restart'})


    cell = new_code_cell(code)
    msg_id = client.execute(code, stop_on_error=False)

    output_msgs = []  # initialize a list to store all output messages

    # Keep track of last 'stream' output
    last_stream_output = None

    while True:
        try:
            msg = client.get_iopub_msg(timeout=120)
            print(msg)

            if msg['parent_header'] and msg['parent_header']['msg_id'] and msg['parent_header']['msg_id'] == msg_id:
                if msg['msg_type'] in ['stream', 'display_data', 'execute_result', 'error']:
                    output = output_from_msg(msg)
                    cell.outputs.append(output)
                    outputTruncate = truncate_output(output)

                    # If this is a stream message, store it and continue
                    if msg['msg_type'] == 'stream':
                        last_stream_output = outputTruncate
                        continue

                    # If this is not a stream message and there is a last stream output,
                    # append it to output messages and reset last_stream_output
                    if last_stream_output is not None:
                        output_msgs.append(last_stream_output)
                        last_stream_output = None

                    # Always append the current output
                    output_msgs.append(outputTruncate)

                elif msg['msg_type'] == 'status' and msg['content']['execution_state'] == 'idle':
                    # If there is a last stream output before going idle, append it to output messages
                    if last_stream_output is not None:
                        output_msgs.append(last_stream_output)
                        last_stream_output = None
                    break  # Execution has finished, so stop waiting for more output messages

        except Empty:
            break



    notebook.cells.append(cell)

    with open(os.path.join('sessions', f'{session_id}.ipynb'), 'w') as f:
        write(notebook, f)

    try:
        msg = client.get_shell_msg(timeout=120)
        if msg['parent_header']['msg_id'] == msg_id and msg['content']['status'] == 'ok':
            if not output_msgs:  # if output_msgs list is empty
                return jsonify([{'status': 'ok', 'output_type': 'no_output'}])
            else:
                return jsonify(output_msgs)  # return all output messages
    except Empty:
        return jsonify([{'output_type': 'timeout', 'text': 'Timeout waiting for reply'}])

    if not output_msgs:  # if output_msgs list is empty
        return jsonify({'output_type': 'unknow_error', 'text': 'Unknown error occurred'})
    else:
        return jsonify(output_msgs)  # return all output messages
   



def signal_handler(sig, frame):
    print('Stopping kernels and channels...')
    for session in sessions.values():
        session['client'].stop_channels()
        session['km'].shutdown_kernel(now=True)
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5008)
