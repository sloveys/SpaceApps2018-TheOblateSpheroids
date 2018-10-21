#!/user/bin/env python
from __future__ import with_statement
import csv
import re
import os
import glob
import filecmp
import shutil


PATH = "C:/Users/Alejandro/Documents/space/SpaceApps2018-TheOblateSphereoids/data/CSV"

OUTPATH = "C:\Users\Alejandro\Documents\space\SpaceApps2018-TheOblateSpheroids\data\OUTPUT"

def main():

	for someFile in os.listdir(OUTPATH):
		file_path = os.path.join(OUTPATH, someFile)
		try:
			if os.path.isfile(file_path):
				os.unlink(file_path)
			elif os.path.isdir(file_path): shutil.rmtree(file_path)
		except Exception as e:
			print e
			
	for path, dirs, files in os.walk("."):
		for dirname in dirs:
			if (dirname == "Data-L2_retreival_grid"):
				latitude = 0
				longitude = 0
				date = 0
				dateTime = 0
				gasFilesPath = os.path.join(path, dirname)
				gasFiles = [f for f in os.listdir(gasFilesPath) if os.path.isfile(os.path.join(gasFilesPath, f))]
				
				
				fileLocation = os.path.join(gasFilesPath, "../")
				readmeFile = [f for f in os.listdir(fileLocation) if os.path.isfile(os.path.join(fileLocation, f))]
				try:
					fileLocation = os.path.join(fileLocation, readmeFile[0])
				except:
					continue
				
				with open(fileLocation, 'r') as searchfile:
					for line in searchfile:
						if 'date =' in line:
							date = line
							date = date[7:]
							year = date
							dateTime = date
							date = date[0:10]
							year = year[0:4]
							dateTime = dateTime[0:len(dateTime)-1]
							date = re.sub('\-','_', date)
							dateTime = re.sub('\-','_', dateTime)
							dateTime = re.sub('\+','_', dateTime)
							
							dateTime = re.sub('\:','_', dateTime)
							dateTime = re.sub('\.','_', dateTime)

						elif 'latitude =' in line:
							latitude = line
							latitude = re.sub('\latitude = ', '', latitude)
							latitude = latitude[0:len(latitude)-1]
							
						elif 'longitude =' in line:
							longitude = line
							longitude = re.sub('\longitude = ', '', longitude)
							longitude = longitude[0:len(longitude)-1]
							
				
				
			
				
				
					for fileName in gasFiles:
						
						gasType = fileName
						gasType = re.sub("\.csv", '', gasType)
						gasTypeTester = gasType
						dummy = 0
						
						try:
							gasTypeTester = gasTypeTester[len(gasTypeTester)-4:]
							if gasTypeTester == "_err":
								continue
						except:
							dummy = 1
						sum = 0
						averageOfGas = 0
						readingCount = 0
						with open(os.path.join(gasFilesPath, fileName), 'r') as gasFile:
							for line in gasFile:
								if '-999' in line:
									continue
								elif '-888' in line:
									continue
								else:
									sum = sum + float(line)
									readingCount = readingCount + 1
									
						if readingCount != 0:
							averageOfGas = sum / readingCount
						else:
							averageOfGas= -999
						
						
						
						fileSavePath = os.path.join(OUTPATH, gasType)
						
						
						try:
							os.mkdir(fileSavePath)
						except:
							dummy = 1
						with open(os.path.join(fileSavePath, year + ".csv"), 'a') as summaryFile:
							summaryFileWriter = csv.writer(summaryFile, delimiter = ',')
							summaryFileWriter.writerow([averageOfGas, latitude, longitude])
						
						
				
				

if __name__ == '__main__':
    main()
