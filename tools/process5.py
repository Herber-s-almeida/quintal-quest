import numpy as np
from PIL import Image
from scipy import ndimage
U='/mnt/user-data/uploads/'; OUT='/home/claude/game/assets/'
im=Image.open(U+'63e5c0e6-image.png').convert('RGB').crop((2,38,1523,310)); im=im.resize((round(1521*360/272),360),Image.LANCZOS); im.save(OUT+'kmesa2.png',optimize=True)
im=Image.open(U+'f45476e6-image.png').convert('RGB'); im.resize((640,360),Image.LANCZOS).save(OUT+'kfloor2.png',optimize=True)
im.resize((1066,600),Image.LANCZOS).save(OUT+'kfall.png',optimize=True)
def mask(a):
    rgb=a[:,:,:3].astype(int); mn=rgb.min(2); mx=rgb.max(2); cand=(mn>195)&((mx-mn)<22)
    lab,n=ndimage.label(cand); border=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    return ~np.isin(lab,list(border))
a=np.array(Image.open(U+'baff82fa-image.png').convert('RGBA')); fg=mask(a); fg=ndimage.binary_opening(fg,iterations=2)
lab,n=ndimage.label(fg); objs=ndimage.find_objects(lab)
for i,o in enumerate(objs):
    if (o[0].stop-o[0].start)*(o[1].stop-o[1].start)>20000: print(i+1,o[1].start,o[0].start,o[1].stop,o[0].stop)
def cut(box,ids,scale,name,whole=False):
    x0,y0,x1,y1=box; sub=a[y0:y1,x0:x1].copy(); m=fg[y0:y1,x0:x1] if whole else np.isin(lab[y0:y1,x0:x1],ids)
    sub[:,:,3]=np.where(m,255,0); r=Image.fromarray(sub).resize((round((x1-x0)*scale),round((y1-y0)*scale)),Image.LANCZOS); b=np.array(r); b[:,:,3]=np.where(b[:,:,3]>110,255,0); Image.fromarray(b).save(OUT+name+'.png'); print(name,b.shape)
import sys
globals()['lab']=lab
cut((88,260,1642,892),[1],.19,'kbowl')
cut((96,548,358,806),None,.17,'tball',whole=True)
