# Extraction fails on windows, but Python will handle illegal names automatically

from zipfile import ZipFile

path = 'dep-contri_congruence.zip'
file = ZipFile(path, "r")
ZipFile.extractall(file)

