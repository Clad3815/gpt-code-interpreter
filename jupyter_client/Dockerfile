# Use an official Ubuntu runtime as a parent image
FROM ubuntu:20.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Europe/Paris

# Install Python, Node.js, and other dependencies
RUN apt-get update && apt-get install -y \
	python3.9 \
	python3-pip \
	pkg-config \
	libcairo2 \
	libcairo2-dev \
	python3-dev \
	espeak \
	libzbar0 \
	libgdal-dev \
	antiword \
	swig \
	libpulse-dev \
	ffmpeg \
	flac \
	abcmidi \
	timidity \
	libmagickwand-dev \
	python3-gi \
	python3-apt \
	gir1.2-gtk-3.0 \
	gir1.2-webkit2-4.0 \
	build-essential \
	python3-distutils-extra \
	curl \
	nodejs \
	npm

# Install Jupyter and the Python kernel
RUN pip3 install jupyter ipykernel

# Install Pillow
RUN pip3 install Pillow

# Install the Node.js kernel for Jupyter
RUN npm install -g --unsafe-perm ijavascript
RUN ijsinstall



# Set the working directory in the container to /app
WORKDIR /mnt/jupyter

# Add the requirements file
ADD requirements.txt /mnt/jupyter/

# Add the extra requirements file
ADD extra-requirements.txt /mnt/jupyter/

# Add the custom requirements file
ADD custom-requirements.txt /mnt/jupyter/

# Install any needed packages specified in requirements.txt
RUN pip3 install -r requirements.txt

# Install any extra packages
RUN pip3 install -r extra-requirements.txt

# Install any custom packages
RUN pip3 install -r custom-requirements.txt


# Install global packages
RUN npm install puppeteer axios cheerio body-parser cors

# Add the rest of the application
ADD app.py /mnt/jupyter/
RUN mkdir /mnt/jupyter/sessions
RUN mkdir /mnt/data

# Make ports 5008 and 8888 available to the world outside this container
EXPOSE 5008 8888

# Run app.py and the Jupyter notebook server when the container launches
CMD ["sh", "-c", "python3 app.py & jupyter notebook --ip 0.0.0.0 --port 8888 --no-browser --allow-root"]
