#!/user/bin/env python
from __future__ import with_statement
import csv
import re
import os
import glob
import filecmp


PATH = "C:/Users/Alejandro/Documents/space/SpaceApps2018-TheOblateSphereoids/data/CSV"

OUTPATH = "C:\Users\Alejandro\Documents\space\SpaceApps2018-TheOblateSpheroids\data\OUTPUT"

def main():
    print PATH
    for path, dirs, files in os.walk("."):
        print path
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
				fileLocation = os.path.join(fileLocation, readmeFile[0])
				
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
							print dateTime
							print date
							print year
						elif 'latitude =' in line:
							latitude = line
							latitude = re.sub('\latitude = ', '', latitude)
							latitude = latitude[0:len(latitude)-1]
							
						elif 'longitude =' in line:
							longitude = line
							longitude = re.sub('\longitude = ', '', longitude)
							longitude = longitude[0:len(longitude)-1]
							
				
				
				outputPath = os.path.join(OUTPATH, dateTime + ".csv")
				print outputPath
				with open(outputPath, 'a') as outputFile:
				
				
					for fileName in gasFiles:
						gasFileWriter = csv.writer(outputFile, delimiter = ',')
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
							print "Average of [" + fileName + "] = " + str(averageOfGas)
						gasType = fileName
						gasType = re.sub("\.csv", '', gasType)
						print gasType
						gasFileWriter.writerow([gasType, averageOfGas, longitude, latitude])
				
				outputFiles = [f for f in os.listdir(OUTPATH) if os.path.isfile(os.path.join(OUTPATH, f))]
				

if __name__ == '__main__':
    main()
