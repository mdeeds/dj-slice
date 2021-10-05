from numpy.lib.function_base import average
from numpy.lib.type_check import imag
from scipy.io import wavfile
import numpy as np
import math
from math import floor
import cv2
import glob

k_window_size = 4096
k_step_size = 128


def save_spectrogram(fname, spectrogram):
    img_size = 1024
    spec = spectrogram.copy()
    spec = spec/np.max(spec)
    third = floor(len(spec[0])/200)
    colors = []
    mag = []
    for s in spec:
        b = (np.average(s[0:third]))
        g = (np.average(s[third:2*third]))
        r = (np.average(s[third*2:3*third]))
        color_max = max(r, g, b)
        if(color_max != 0):
            r = int(r/color_max * 255)
            g = int(g/color_max * 255)
            b = int(b/color_max * 255)
        colors.append([b, g, r])
        mag.append(color_max)
    mag = mag / np.max(mag) * img_size/2
    # black out image
    image_data = []
    for x in range(img_size):
        row = []
        for y in range(img_size):
            row.append([0, 0, 0])
        image_data.append(row)
    # draw grid lines
    ticks = []
    # beats
    ticks.append((1/6*np.pi, (1/6+1/100)*np.pi, 0))
    ticks.append((7/12*np.pi, (7/12+1/100)*np.pi, 0))
    ticks.append((1*np.pi, (1+1/100)*np.pi, 0))
    ticks.append((17/12*np.pi, (17/12+1/100)*np.pi, 0))
    # # eights
    ticks.append((2/12*np.pi, (3.25/12-1/100)*np.pi, floor(24/50*img_size)))
    ticks.append((3.25/12*np.pi, (4.5/12-1/100)*np.pi, floor(24/50*img_size)))
    ticks.append((4.5/12*np.pi, (5.75/12-1/100)*np.pi, floor(24/50*img_size)))
    ticks.append((5.75/12*np.pi, (7/12-1/100)*np.pi, floor(24/50*img_size)))
    ticks.append((7/12*np.pi, (8.25/12-1/100)*np.pi, floor(24/50*img_size)))
    ticks.append((8.25/12*np.pi, (9.5/12-1/100)*np.pi, floor(24/50*img_size)))
    ticks.append((9.5/12*np.pi, (10.75/12-1/100)*np.pi, floor(24/50*img_size)))
    ticks.append((10.75/12*np.pi, (12/12-1/100)*np.pi, floor(24/50*img_size)))
    ticks.append((12/12*np.pi, (13.25/12-1/100)*np.pi, floor(24/50*img_size)))
    ticks.append((13.25/12*np.pi, (14.5/12-1/100)
                  * np.pi, floor(24/50*img_size)))
    ticks.append((14.5/12*np.pi, (15.75/12-1/100)
                  * np.pi, floor(24/50*img_size)))
    ticks.append((15.75/12*np.pi, (17/12-1/100)*np.pi, floor(24/50*img_size)))
    ticks.append((17/12*np.pi, (18.25/12-1/100)*np.pi, floor(24/50*img_size)))
    ticks.append((18.25/12*np.pi, (19.5/12-1/100)
                  * np.pi, floor(24/50*img_size)))
    ticks.append((19.5/12*np.pi, (20.75/12-1/100)
                  * np.pi, floor(24/50*img_size)))
    ticks.append((20.75/12*np.pi, (22/12-1/100)*np.pi, floor(24/50*img_size)))

    for t in ticks:
        theta_start, theta_stop, r_start = t
        theta_length = theta_stop-theta_start
        for theta in np.arange(theta_start, theta_stop, np.pi/3000):
            r_stop = floor(img_size/2)
            for r in range(r_start, r_stop, 1):
                x = floor(img_size/2+math.cos(theta)*r)
                y = floor(img_size/2-math.sin(theta)*r)
                image_data[x][y] = [255, 255, 255]

    # polar plot FFT
    theta_start = np.pi/6
    theta_stop = 11/6*np.pi
    theta_length = theta_stop-theta_start
    for theta in np.arange(theta_start, theta_stop, np.pi/3000):
        index = floor((theta-theta_start) * len(colors)/theta_length)
        index = min(index, len(colors)-1)
        r_start = floor((img_size/4)-mag[index]/2)
        r_stop = floor(min(img_size/4+mag[index]/2, img_size/2-1))
        for r in range(r_start, r_stop, 1):
            x = floor(img_size/2+math.cos(theta)*r)
            y = floor(img_size/2-math.sin(theta)*r)
            image_data[x][y] = colors[index]
    cv2.imwrite(fname, np.array(image_data))


files = glob.glob("*.wav")
for filename in files:
    sample_rate, data = wavfile.read(filename)
    mono = []
    for d in data:
        mono.append(np.average(d))
    data = mono/np.max(mono)

    window = np.hamming(k_window_size)
    spectrogram = []
    for start_sample in range(0, len(data), k_step_size):
        end_sample = start_sample + k_window_size
        if end_sample < len(data):
            slice = abs(np.fft.fft(data[start_sample:end_sample]*window))
            spectrogram.append(slice)
    save_spectrogram(filename+".png", spectrogram)
