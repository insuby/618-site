import glob
import os

for path in glob.glob('*/*.png'):
    folder = path.split('\\')[0]
    filename = path.split('\\')[1].split('.')[0]
    resultPath = '../textures/' + folder + '/' + filename + '.basis'

    if not os.path.isdir('../textures/' + folder):
        os.mkdir('../textures/' + folder)

    basis = 'basisu.exe ' + path + ' -y_flip -output_file ' + resultPath

    if 'normal' in path:
        basis += ' -uastc -normal_map'

    os.system(basis)
