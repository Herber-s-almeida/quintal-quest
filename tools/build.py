import base64,json,os
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A=os.path.join(ROOT,'assets')+os.sep
assets={}
for f in sorted(os.listdir(A)):
    if f.endswith('.png'): assets[f[:-4]]='data:image/png;base64,'+base64.b64encode(open(A+f,'rb').read()).decode()
for f in sorted(os.listdir(A)):
    if f.endswith('.json'): assets[f[:-5]+'json']=json.load(open(A+f))
s=open(os.path.join(ROOT,'shell.html')).read()
s=s.replace('/*ASSETS*/',json.dumps(assets)).replace('/*GAME*/',open(os.path.join(ROOT,'game.js')).read())
open(os.path.join(ROOT,'index.html'),'w').write(s)
print(len(s)//1024,'KB')
