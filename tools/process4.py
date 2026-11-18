import numpy as np, json
from PIL import Image
from scipy import ndimage
U='/mnt/user-data/uploads/'; OUT='/home/claude/game/assets/'
def mask_checker(a):
    rgb=a[:,:,:3].astype(int); mn=rgb.min(2); mx=rgb.max(2); cand=(mn>195)&((mx-mn)<22)
    lab,n=ndimage.label(cand); border=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    fg=~np.isin(lab,list(border)); fg=ndimage.binary_opening(fg,iterations=1); return fg
def comps(fg,minarea=2000):
    lab,n=ndimage.label(fg); objs=ndimage.find_objects(lab); out=[]
    for i,o in enumerate(objs):
        m=lab[o]==i+1
        if m.sum()>minarea: out.append((o[1].start,o[0].start,o[1].stop,o[0].stop,i+1))
    return lab,out
def save_part(a,lab,ids,box,scale,name):
    x0,y0,x1,y1=box; sub=a[y0:y1,x0:x1].copy(); m=np.isin(lab[y0:y1,x0:x1],ids)
    sub[:,:,3]=np.where(m,255,0); im=Image.fromarray(sub).resize((round((x1-x0)*scale),round((y1-y0)*scale)),Image.LANCZOS)
    b=np.array(im); b[:,:,3]=np.where(b[:,:,3]>110,255,0); Image.fromarray(b).save(OUT+name+'.png'); return b.shape
meta={}
# side head parts
a=np.array(Image.open(U+'379dd6d1-image.png').convert('RGBA')); fg=mask_checker(a); lab,cs=comps(fg)
print('side',[c[:4] for c in cs])
S=.30
for c in cs:
    x0,y0,x1,y1,i=c; cx=(x0+x1)/2; cy=(y0+y1)/2
    nm='dhead' if (x1-x0)>700 else ('dtongue' if x0>1000 else 'djaw')
    save_part(a,lab,[i],(x0,y0,x1,y1),S,nm); meta[nm]=[x0*S,y0*S]
# front head
a=np.array(Image.open(U+'c795ce86-image.png').convert('RGBA')); fg=mask_checker(a); lab,cs=comps(fg)
print('front',[c[:4] for c in cs])
big=max(cs,key=lambda c:(c[2]-c[0])*(c[3]-c[1])); ids=[c[4] for c in cs]
x0=min(c[0] for c in cs); y0=min(c[1] for c in cs); x1=max(c[2] for c in cs); y1=max(c[3] for c in cs)
print(save_part(a,lab,ids,(x0,y0,x1,y1),.21,'dfront'))
# paw (top-left leg)
a=np.array(Image.open(U+'1332e15a-image.png').convert('RGBA')); fg=mask_checker(a); lab,cs=comps(fg)
print('paws',[c[:4] for c in cs])
leg=min([c for c in cs if c[1]<300],key=lambda c:c[0]); print(save_part(a,lab,[leg[4]],leg[:4],.62,'dpaw'))
json.dump(meta,open(OUT+'dogparts.json','w')); print(meta)
# textures
def tex(src,box,name,size=64):
    im=Image.open(U+src).convert('RGB').crop(box).resize((size,size),Image.LANCZOS); im.save(OUT+name+'.png')
tex('d6098c73-image.png',(30,790,205,925),'tex_piso')
tex('3ba1e749-image.png',(20,845,200,995),'tex_mesa')
tex('9be663bd-image.png',(24,576,308,858),'tex_bath')
tex('4a05416a-image.png',(1420,50,1655,290),'tex_sewer')
