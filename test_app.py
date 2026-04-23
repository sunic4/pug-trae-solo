from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:3000')
    page.wait_for_load_state('networkidle')
    
    # 截图保存
    page.screenshot(path='/tmp/app_screenshot.png', full_page=True)
    
    # 检查Canvas元素是否存在
    canvas = page.locator('canvas#app')
    if canvas.is_visible():
        print("Canvas element found")
    else:
        print("Canvas element not found")
    
    # 获取Canvas尺寸
    canvas_bounding_box = canvas.bounding_box()
    if canvas_bounding_box:
        print(f"Canvas size: {canvas_bounding_box['width']}x{canvas_bounding_box['height']}")
    
    # 获取页面内容
    content = page.content()
    print("Page content length:", len(content))
    
    # 检查控制台日志
    console_logs = []
    def log_message(msg):
        console_logs.append(msg.text)
    
    page.on('console', log_message)
    
    # 等待几秒钟让应用渲染
    page.wait_for_timeout(3000)
    
    print("Console logs:")
    for log in console_logs:
        print(f"- {log}")
    
    browser.close()
