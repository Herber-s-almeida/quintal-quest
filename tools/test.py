import asyncio,sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--autoplay-policy=no-user-gesture-required'])
        pg=await b.new_page(viewport={'width':1280,'height':720})
        errs=[]
        pg.on('console',lambda m: errs.append(m.text) if m.type in('error','warning') else None)
        pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)))
        await pg.goto('file:///home/claude/game/index.html'); await pg.wait_for_timeout(1500)
        await pg.screenshot(path='/tmp/s_title.png')
        await pg.keyboard.press('Space'); await pg.wait_for_timeout(1200)
        await pg.screenshot(path='/tmp/s_map.png')
        lvl=int(sys.argv[1]) if len(sys.argv)>1 else 0
        if lvl: await pg.evaluate(f"prog.unlocked=4; mapState.node={lvl}")
        await pg.keyboard.press('Space'); await pg.wait_for_timeout(2200)
        await pg.screenshot(path='/tmp/s_play0.png')
        await pg.keyboard.down('ArrowRight'); await pg.wait_for_timeout(900)
        await pg.keyboard.press('Space'); await pg.wait_for_timeout(250)
        await pg.screenshot(path='/tmp/s_play1.png')
        await pg.keyboard.press('KeyX'); await pg.wait_for_timeout(100)
        await pg.screenshot(path='/tmp/s_play2.png')
        await pg.wait_for_timeout(1500)
        await pg.screenshot(path='/tmp/s_play3.png')
        await pg.keyboard.up('ArrowRight')
        # teleport to flag
        await pg.evaluate("P.x=G.L.flag.x-30;P.y=G.L.flag.y;G.camX=P.x-300;P.inv=5")
        await pg.keyboard.down('ArrowRight'); await pg.wait_for_timeout(600); await pg.keyboard.up('ArrowRight')
        await pg.wait_for_timeout(1300); await pg.screenshot(path='/tmp/s_clear1.png')
        await pg.wait_for_timeout(2500); await pg.screenshot(path='/tmp/s_clear2.png')
        await pg.keyboard.press('Space'); await pg.wait_for_timeout(2600); await pg.screenshot(path='/tmp/s_map2.png')
        print('\n'.join(errs[:20]) or 'no errors')
        await b.close()
asyncio.run(main())
