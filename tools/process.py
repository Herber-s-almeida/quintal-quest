import numpy as np, json, sys
from PIL import Image
from scipy import ndimage
U='/mnt/user-data/uploads/'
OUT='/home/claude/game/assets/'
SCALE=50/313
def load(f): return np.array(Image.open(U+f+'-image.png').convert('RGB')).astype(int)
def bgmask(a):
    mx=a.max(2);mn=a.min(2)
    cand=(mn>200)&((mx-mn)<18)
    lab,n=ndimage.label(cand)
    border=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    return np.isin(lab,list(border))
def cut(a,x0,x1,y0,y1,shadow=False):
    sub=a[y0:y1,x0:x1]
    bg=bgmask(sub)
    if shadow:
        mx=sub.max(2);mn=sub.min(2)
        # shadow: light-ish bluish gray, low contrast, below feet region
        sh=(mn>120)&(sub[:,:,2]>sub[:,:,0]+8)&(mx<235)
        h=sub.shape[0]; sh[:int(h*0.80)]=False
        bg|=sh
        # remove regions now disconnected? keep simple
    alpha=np.where(bg,0,255).astype(np.uint8)
    # remove tiny islands
    lab,n=ndimage.label(alpha>0)
    if n>1:
        sizes=ndimage.sum(alpha>0,lab,range(1,n+1))
        for i,s in enumerate(sizes):
            if s<150: alpha[lab==i+1]=0
    rgba=np.dstack([sub.astype(np.uint8),alpha])
    return rgba
def tight(rgba):
    al=rgba[:,:,3]>0
    ys,xs=np.where(al)
    return rgba[ys.min():ys.max()+1, xs.min():xs.max()+1]
def shrink(rgba):
    im=Image.fromarray(rgba,'RGBA')
    w,h=im.size
    im=im.resize((max(1,round(w*SCALE)),max(1,round(h*SCALE))),Image.BOX)
    a=np.array(im)
    a[:,:,3]=np.where(a[:,:,3]>110,255,0)
    return a
def headx(rgba):
    al=rgba[:,:,3]>0
    h=al.shape[0]
    top=al[int(h*0.18):int(h*0.55)]
    ys,xs=np.where(top)
    return xs.mean()
sheets={
 'run':('147db271',[(55, 283), (322, 546), (586, 807), (838, 1071), (1103, 1331), (1368, 1592), (1628, 1850), (1894, 2118)],0,724,False),
 'hurt':('2529e812',[(31, 227), (280, 488), (519, 754), (777, 1005), (1042, 1227), (1267, 1504)],0,1024,False),
 'walk':('92804534',[(42, 246), (312, 516), (581, 788), (847, 1065), (1123, 1330), (1397, 1601), (1668, 1871), (1937, 2136)],0,724,True),
 'punch':('fa26faf8',[(32, 238), (300, 501), (559, 769), (824, 1048), (1094, 1388), (1397, 1602), (1656, 1861), (1908, 2108)],0,522,False),
}
frames={}
for name,(f,segs,y0,y1,sh) in sheets.items():
    a=load(f)
    out=[]
    for (x0,x1) in segs:
        r=cut(a,max(0,x0-6),min(a.shape[1],x1+6),y0,y1,sh)
        r=tight(r); r=shrink(r)
        if sh:
            lum=r[:,:,:3].astype(int).mean(2)
            h=r.shape[0]
            m=np.zeros_like(lum,bool); m[h-7:]=True
            r[(lum>105)&m,3]=0
            r=tight(r)
        out.append(r)
    frames[name]=out
# body anchor: bottom of bbox; x = head center. For punch use first-frame head offset logic too
CW,CH=64,60
def hue_red(rgba):
    im=Image.fromarray(rgba[:,:,:3]).convert('HSV')
    h=np.array(im).astype(int)
    blue=(h[:,:,0]>140)&(h[:,:,0]<200)&(h[:,:,1]>40)
    h[:,:,0]=np.where(blue,(h[:,:,0]+105)%256,h[:,:,0])
    h[:,:,1]=np.where(blue,np.minimum(255,h[:,:,1]*1.35),h[:,:,1])
    rgb=np.array(Image.fromarray(h.astype(np.uint8),'HSV').convert('RGB'))
    return np.dstack([rgb,rgba[:,:,3]])
atlas_frames=[]
meta={}
for name,lst in frames.items():
    meta[name]=[]
    for fr in lst:
        h,w=fr.shape[:2]
        hx=headx(fr)
        cell=np.zeros((CH,CW,4),np.uint8)
        ox=int(round(CW/2-hx)); oy=CH-h
        # paste with clipping
        for (dst,src) in [(cell,fr)]:
            xs0=max(0,ox); ys0=max(0,oy)
            xs1=min(CW,ox+w); ys1=min(CH,oy+h)
            dst[ys0:ys1,xs0:xs1]=src[ys0-oy:ys1-oy, xs0-ox:xs1-ox]
        meta[name].append(len(atlas_frames)); atlas_frames.append(cell)
N=len(atlas_frames)
atl=np.zeros((CH*2,CW*N,4),np.uint8)
for i,c in enumerate(atlas_frames):
    atl[:CH,i*CW:(i+1)*CW]=c
    atl[CH:,i*CW:(i+1)*CW]=hue_red(c)
Image.fromarray(atl,'RGBA').save(OUT+'ant.png')
json.dump({'cw':CW,'ch':CH,'anims':meta},open(OUT+'ant.json','w'))
print('frames',N, {k:[f.shape for f in v][:2] for k,v in frames.items()})
# backgrounds
def bg(f,name,opaque=False,size=(640,360),dark=False,crop=None):
    im=Image.open(U+f+'-image.png').convert('RGBA')
    if crop: im=im.crop(crop)
    if size[0] is None:
        size=(round(im.size[0]*size[1]/im.size[1]),size[1])
    im=im.resize(size,Image.LANCZOS)
    a=np.array(im)
    if opaque: a[:,:,3]=255
    else: a[:,:,3]=np.where(a[:,:,3]>100,255,0)
    if dark: a[:,:,:3]=0
    Image.fromarray(a).save(OUT+name+'.png',optimize=True)
bg('fb8a2bf1','fg_garden1');bg('d065779f','mist')
bg('cd7053b3','sky_day',True)
bg('dc4ff25a','ball');bg('0b7f7bea','castle');bg('296d4e8c','sand_fg')
bg('575029c0','anthill',True,(None,360));bg('9c7ddc46','forest',True,(None,360));bg('e5c3e631','swamp',True,(None,360))
bg('fb8a2bf1','silh',False,(640,130),True,(0,600,1672,941))
