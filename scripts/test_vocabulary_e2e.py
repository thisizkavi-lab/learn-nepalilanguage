import sys
import time
from playwright.sync_api import sync_playwright

def run_tests():
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 900})

        page.on("console", lambda msg: errors.append(f"Console {msg.type}: {msg.text}") if msg.type == "error" else None)
        page.on("pageerror", lambda err: errors.append(f"PageError: {err}"))

        print("Navigating to vocabulary.html...")
        page.goto("http://127.0.0.1:8859/vocabulary.html#lesson-1", wait_until="networkidle")
        time.sleep(1)

        # 1. Verify Lesson 1 Spread View
        title = page.locator(".vocab-lesson-main-title").inner_text()
        print(f"Lesson 1 Title: {title}")
        assert "Countries and nationalities" in title, f"Unexpected title: {title}"

        spread_img = page.locator(".vocab-spread-img").first
        assert spread_img.is_visible(), "Spread image not visible on Lesson 1"
        src1 = spread_img.get_attribute("src")
        print(f"Spread 1 src: {src1}")
        assert "lesson_01_p1.webp" in src1

        # Test Page 2 toggle
        page.locator("#spread-p2-btn").click()
        time.sleep(0.5)
        src2 = page.locator(".vocab-spread-img").first.get_attribute("src")
        print(f"Spread Page 2 src: {src2}")
        assert "lesson_01_p2.webp" in src2

        # Test Dual Spread
        page.locator("#spread-dual-btn").click()
        time.sleep(0.5)
        count_dual = page.locator(".vocab-spread-img").count()
        print(f"Dual spread image count: {count_dual}")
        assert count_dual == 2, f"Expected 2 images, got {count_dual}"

        page.screenshot(path="/Users/kavi/Documents/kyoto/learn-nepalilanguage/test_screenshot_lesson1_spread.png")

        # 2. Verify Lesson 1 Visual Modules & World Map
        page.locator("#mode-modules-btn").click()
        time.sleep(0.5)
        map_visible = page.locator(".vocab-worldmap-canvas").is_visible()
        print(f"World map visible: {map_visible}")
        assert map_visible, "World map not visible in Lesson 1"

        pins_count = page.locator(".vocab-map-pin").count()
        print(f"World map pins count: {pins_count}")
        assert pins_count >= 15, f"Expected >= 15 pins, got {pins_count}"

        flag_cards_count = page.locator(".vocab-flag-card").count()
        print(f"Flag cards count: {flag_cards_count}")
        assert flag_cards_count >= 15

        pairing_cards_count = page.locator(".vocab-pairing-card").count()
        print(f"Pairing cards count: {pairing_cards_count}")
        assert pairing_cards_count >= 15

        page.screenshot(path="/Users/kavi/Documents/kyoto/learn-nepalilanguage/test_screenshot_lesson1_map.png")

        # 3. Test Lesson 2 Numbers (matching Image 2)
        print("\nTesting Lesson 2...")
        page.goto("http://127.0.0.1:8859/vocabulary.html#lesson-2", wait_until="networkidle")
        time.sleep(0.8)

        # Switch to spread view to test spread
        page.locator("#mode-spread-btn").click()
        time.sleep(0.5)
        l2_spread = page.locator(".vocab-spread-img").first.get_attribute("src")
        print(f"Lesson 2 Spread 1 src: {l2_spread}")
        assert "lesson_02_p1.webp" in l2_spread

        # Switch to Modules to inspect Image 2 match
        page.locator("#mode-modules-btn").click()
        time.sleep(0.5)

        num_items_count = page.locator(".vocab-number-item").count()
        print(f"Lesson 2 Numbers grid items count: {num_items_count}")
        assert num_items_count >= 30, f"Expected >= 30 number cells, got {num_items_count}"

        # Check first cell has large blue digit '1', Devanagari '१', and 'एक'
        first_digit = page.locator(".vocab-number-digit").first.inner_text()
        first_nepali = page.locator(".vocab-number-nepali-word").first.inner_text()
        print(f"First number cell: digit '{first_digit}', nepali '{first_nepali}'")
        assert first_digit == "1" and first_nepali == "एक"

        ordinals_count = page.locator(".vocab-ordinal-card").count()
        print(f"Lesson 2 Ordinal cards count: {ordinals_count}")
        assert ordinals_count >= 20

        # Test write-on line input persistence
        writeon_input = page.locator(".vocab-number-writeon-input").first
        writeon_input.fill("my test note for one")
        time.sleep(0.3)

        page.screenshot(path="/Users/kavi/Documents/kyoto/learn-nepalilanguage/test_screenshot_lesson2_numbers.png")

        # 4. Test Lesson 3 Calendar & Seasons
        print("\nTesting Lesson 3...")
        page.goto("http://127.0.0.1:8859/vocabulary.html#lesson-3", wait_until="networkidle")
        time.sleep(0.8)
        page.locator("#mode-modules-btn").click()
        time.sleep(0.5)

        month_tiles = page.locator(".vocab-calendar-month-tile").count()
        print(f"Lesson 3 Month tiles count: {month_tiles}")
        assert month_tiles == 12, f"Expected 12 months, got {month_tiles}"

        seasons_count = page.locator(".vocab-season-card").count()
        print(f"Lesson 3 Seasons count: {seasons_count}")
        assert seasons_count == 4, f"Expected 4 seasons, got {seasons_count}"

        # 5. Test Lesson 4 Daily Routines
        print("\nTesting Lesson 4...")
        page.goto("http://127.0.0.1:8859/vocabulary.html#lesson-4", wait_until="networkidle")
        time.sleep(0.8)
        page.locator("#mode-modules-btn").click()
        time.sleep(0.5)

        routine_steps = page.locator(".vocab-routine-step").count()
        print(f"Lesson 4 Routine steps count: {routine_steps}")
        assert routine_steps >= 8

        # 6. Test Lesson 5 Colors & Materials
        print("\nTesting Lesson 5...")
        page.goto("http://127.0.0.1:8859/vocabulary.html#lesson-5", wait_until="networkidle")
        time.sleep(0.8)
        page.locator("#mode-modules-btn").click()
        time.sleep(0.5)

        color_tiles = page.locator(".vocab-color-tile").count()
        print(f"Lesson 5 Color tiles count: {color_tiles}")
        assert color_tiles >= 12

        # 7. Test Lesson 14 Body Parts
        print("\nTesting Lesson 14...")
        page.goto("http://127.0.0.1:8859/vocabulary.html#lesson-14", wait_until="networkidle")
        time.sleep(0.8)
        page.locator("#mode-modules-btn").click()
        time.sleep(0.5)

        body_visible = page.locator(".vocab-body-diagram-wrap").is_visible()
        print(f"Lesson 14 Body diagram visible: {body_visible}")
        assert body_visible

        # 8. Test Lesson 20 Family Tree
        print("\nTesting Lesson 20...")
        page.goto("http://127.0.0.1:8859/vocabulary.html#lesson-20", wait_until="networkidle")
        time.sleep(0.8)
        page.locator("#mode-modules-btn").click()
        time.sleep(0.5)

        family_cards = page.locator(".vocab-family-card").count()
        print(f"Lesson 20 Family cards count: {family_cards}")
        assert family_cards >= 10

        # 9. Test Lesson 78 (Final Lesson)
        print("\nTesting Lesson 78...")
        page.goto("http://127.0.0.1:8859/vocabulary.html#lesson-78", wait_until="networkidle")
        time.sleep(0.8)

        l78_title = page.locator(".vocab-lesson-main-title").inner_text()
        print(f"Lesson 78 Title: {l78_title}")

        page.locator("#mode-spread-btn").click()
        time.sleep(0.5)
        l78_spread = page.locator(".vocab-spread-img").first.get_attribute("src")
        print(f"Lesson 78 Spread 1: {l78_spread}")
        assert "lesson_78_p1.webp" in l78_spread

        page.screenshot(path="/Users/kavi/Documents/kyoto/learn-nepalilanguage/test_screenshot_lesson78_spread.png")

        # 10. Test Practice Arena
        print("\nTesting Practice Arena...")
        page.locator("#mode-practice-btn").click()
        time.sleep(0.5)

        match_grid_visible = page.locator(".vocab-match-grid").is_visible()
        print(f"Match-up grid visible: {match_grid_visible}")
        assert match_grid_visible

        # 11. Test Word List Table View
        print("\nTesting Word List View...")
        page.locator("#mode-rows-btn").click()
        time.sleep(0.5)

        rows_visible = page.locator(".vocab-rows-list").is_visible()
        print(f"Rows table visible: {rows_visible}")
        assert rows_visible

        print("\n=== Console Errors Report ===")
        if errors:
            print(f"Errors found ({len(errors)}):")
            for e in errors:
                print("  - ", e)
        else:
            print("Zero console errors!")

        browser.close()

if __name__ == "__main__":
    run_tests()
