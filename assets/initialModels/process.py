import glob
import os
from pathlib import Path
import csv
from pygltflib import GLTF2, Scene

# Convert csv to glb
for path in glob.glob('./*.csv'):
  gltf = GLTF2()
  scene = Scene()
  gltf.scenes.append(scene)


# Convert obj to glb
for path in glob.glob('./*.obj'):
    filename = Path(path).name
    tempFilename = filename.replace("obj", "glb")

    os.system(f'obj2gltf -i "{path}" -o "{tempFilename}"')


# Convert dae to glb
for path in glob.glob('./*.dae'):
    filename = Path(path).name
    tempFilename = path.replace(".dae", "___temp.glb")

    os.system(f'daeToGltf.exe -i "{path}" -o "{tempFilename}" -b -d --qp 17 --qt 17')


# Convert glb to gltf
for path in glob.glob('./*.glb'):
    filename = Path(path).name
    resultPath = '../models/' + filename.replace('___temp', '')


    os.system(f'gltf-pipeline -i "{filename}" -o "{resultPath}" -d --draco.compressionLevel 7 --draco.quantizeNormalBits 17 --draco.quantizePositionBits 17 -b')

    if path.endswith('temp.glb'):
        os.remove(path)
