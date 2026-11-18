import numpy as np, json
from PIL import Image
from scipy import ndimage
U='/mnt/user-data/uploads/'; OUT='/home/claude/game/assets/'
def comps(alpha, minh=150):
    lab,n=ndimage.label(alpha); objs=ndimage.find_objects(lab)
    out=[(o[1].start,o[0].start,o[1].stop,o[0].stop) for o in objs if (o[0].stop-o[0].start)>minh]
    return out
# climb sheet (RGB checker)
a=np.array(Image.open(U+'61eb24ab-image.png').convert('RGB')).astype(int)
mx=a.max(2);mn=a.min(2);cand=(mn>200)&((mx-mn)<18)
lab,n=ndimage.label(cand); border=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
bg=np.isin(lab,list(border))
climbA=np.dstack([a.astype(np.uint8),np.where(bg,0,255).astype(np.uint8)])
# punch sheet RGBA
pA=np.array(Image.open(U+'517245eb-image.png').convert('RGBA'))
pA[:,:,3]=np.where(pA[:,:,3]>100,255,0)
def frames(arr, minh=150):
    al=arr[:,:,3]>0
    # remove small specks but keep effect lines: group by grid rows/cols
    bx=comps(al,minh)
    bx.sort(key=lambda b:(b[1]//300,b[0]))
    return bx
cb=frames(climbA); pb=frames(pA,120)
print('climb',cb); print('punch',pb)
def crop(arr,b,pad=30):
    x0,y0,x1,y1=b; x0=max(0,x0-pad); x1=min(arr.shape[1],x1+pad); y0=max(0,y0-5); y1=min(arr.shape[0],y1+5)
    sub=arr[y0:y1,x0:x1].copy()
    al=sub[:,:,3]>0; ys,xs=np.where(al); return sub[ys.min():ys.max()+1, xs.min():xs.max()+1]
def shrink(r,sc):
    im=Image.fromarray(r,'RGBA'); w,h=im.size
    im=im.resize((max(1,round(w*sc)),max(1,round(h*sc))),Image.BOX); a=np.array(im); a[:,:,3]=np.where(a[:,:,3]>110,255,0); return a
CW,CH=64,60
cells=[]
def place(fr, cxmode='bbox'):
    h,w=fr.shape[:2]; cell=np.zeros((CH,CW,4),np.uint8)
    al=fr[:,:,3]>0
    if cxmode=='body':
        ys,xs=np.where(al[int(h*.25):int(h*.6)]); cx=xs.mean()
    else: cx=w/2
    ox=int(round(CW/2-cx)); oy=CH-h
    xs0=max(0,ox); ys0=max(0,oy); xs1=min(CW,ox+w); ys1=min(CH,oy+h)
    cell[ys0:ys1,xs0:xs1]=fr[ys0-oy:ys1-oy, xs0-ox:xs1-ox]; return cell
for b in cb: cells.append(place(shrink(crop(climbA,b,8),52/385),'body'))
# punch: for each main body bbox include nearby effect lines (pad 60)
for b in pb:
    fr=crop(pA,b,0)
    cells.append(place(shrink(fr,50/385*1.0),'body'))
N=len(cells); atl=np.zeros((CH,CW*N,4),np.uint8)
for i,c in enumerate(cells): atl[:,i*CW:(i+1)*CW]=c
Image.fromarray(atl).save(OUT+'antclimb.png')
json.dump({'climb':list(range(len(cb))),'punch':list(range(len(cb),N))},open(OUT+'antclimb.json','w'))
# wall texture -> width 420
im=Image.open(U+'42b8a2db-image.png').convert('RGB'); im=im.resize((420,round(2172*420/724)),Image.LANCZOS); im.save(OUT+'wall.png',optimize=True)
im=Image.open(U+'6cc213c1-image.png').convert('RGBA').resize((640,360),Image.LANCZOS); a=np.array(im); a[:,:,3]=255; Image.fromarray(a).save(OUT+'wallbg.png',optimize=True)
im=Image.open(U+'079a90a7-image.png').convert('RGBA').crop((0,560,1390,941)); im=im.resize((640,round(381*640/1390)),Image.LANCZOS); a=np.array(im); a[:,:,3]=np.where(a[:,:,3]>100,255,0); Image.fromarray(a).save(OUT+'grass.png',optimize=True)
im=Image.open(U+'47548235-image.png').convert('RGBA').crop((0,0,1672,135)); im=im.resize((470,round(135*470/1672)),Image.LANCZOS); a=np.array(im); a[:,:,3]=np.where(a[:,:,3]>100,255,0); Image.fromarray(a).save(OUT+'sill.png',optimize=True)
# cracks components
c=np.array(Image.open(U+'1d99b83b-image.png').convert('RGBA')); al=c[:,:,3]>60
dil=ndimage.binary_dilation(al,iterations=6); lab,n=ndimage.label(dil); objs=ndimage.find_objects(lab)
crs=[]
for i,o in enumerate(objs):
    sub=c[o].copy(); m=(lab[o]==i+1)&al[o]; sub[:,:,3]=np.where(m,255,0)
    h=o[0].stop-o[0].start; w=o[1].stop-o[1].start
    if w*h<800: continue
    im=Image.fromarray(sub).resize((max(1,round(w*.28)),max(1,round(h*.28))),Image.BOX); a=np.array(im); a[:,:,3]=np.where(a[:,:,3]>70,255,0)
    crs.append((w*h,a))
crs.sort(key=lambda t:-t[0])
H=max(a.shape[0] for _,a in crs); Wt=sum(a.shape[1]+2 for _,a in crs)
sheet=np.zeros((H,Wt,4),np.uint8); rects=[]; x=0
for _,a in crs: sheet[:a.shape[0],x:x+a.shape[1]]=a; rects.append([x,0,a.shape[1],a.shape[0]]); x+=a.shape[1]+2
Image.fromarray(sheet).save(OUT+'cracks.png'); json.dump(rects,open(OUT+'cracks.json','w'))
print('cracks',len(rects),[r[2:] for r in rects])
