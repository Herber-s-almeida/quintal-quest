import numpy as np
from PIL import Image
from scipy import ndimage
U='/mnt/user-data/uploads/'; OUT='/home/claude/game/assets/'
def bg(src,name,size=(640,360)):
    im=Image.open(src).convert('RGBA').resize(size,Image.LANCZOS); a=np.array(im); a[:,:,3]=255; Image.fromarray(a).save(OUT+name+'.png',optimize=True)
bg(U+'034efcb2-image.png','kmesa'); bg(U+'b7dfdbef-image.png','kpiso'); bg(U+'ffc8c2e2-image.png','bath'); bg(U+'63b53f2e-image.png','sewer')
def cut(src,box,scale,white=False,name=None):
    a=np.array(Image.open(src).convert('RGBA')).astype(int)[box[1]:box[3],box[0]:box[2]].copy()
    if white:
        rgb=a[:,:,:3]; mn=rgb.min(2); mx=rgb.max(2); cand=(mn>215)&((mx-mn)<20)
        lab,n=ndimage.label(cand); border=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
        a[:,:,3]=np.where(np.isin(lab,list(border)),0,255)
    al=a[:,:,3]>90; lab,n=ndimage.label(al)
    if n>1:
        sz=ndimage.sum(al,lab,range(1,n+1)); keep=np.zeros_like(al)
        for i,s in enumerate(sz):
            if s>80: keep|=lab==i+1
        al=keep
    ys,xs=np.where(al); a=a[ys.min():ys.max()+1,xs.min():xs.max()+1]; al=al[ys.min():ys.max()+1,xs.min():xs.max()+1]
    a[:,:,3]=np.where(al,255,0)
    im=Image.fromarray(a.astype(np.uint8)); w,h=im.size; im=im.resize((max(1,round(w*scale)),max(1,round(h*scale))),Image.LANCZOS)
    b=np.array(im); b[:,:,3]=np.where(b[:,:,3]>110,255,0); Image.fromarray(b).save(OUT+name+'.png'); print(name,b.shape)
B=U+'c5b55427-image.png'
cut(B,(752,425,1198,612),.2,name='grate')
cut(B,(1372,450,1522,565),.22,name='sponge')
cut(B,(950,645,1258,748),.28,name='foam')
cut(B,(718,636,866,712),.26,name='bubble')
S=U+'b5403293-image.png'
cut(S,(424,812,572,912),.3,True,'can')
cut(S,(14,818,170,912),.3,True,'rock')
cut(S,(904,850,1054,902),.3,True,'mossrock')
cut(S,(28,732,240,800),.3,True,'slime')
