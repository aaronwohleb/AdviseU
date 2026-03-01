import requests
from bs4 import BeautifulSoup
import re
import json
import time

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def clean_id(text):
    """Sanitizes IDs to lowercase with no spaces (e.g., 'ACCT 201' -> 'acct201')."""
    if not text: return ""
    cleaned = text.replace('or', '').replace('\xa0', '').replace('(', '').replace(')', '').replace('&', '').strip()
    return re.sub(r'\s+', '', cleaned).lower()

def get_ace_dictionary():
    """Scrapes the global ACE database to map outcomes (ACE 1-10) to course IDs."""
    print("Step 1: Harvesting Global ACE Course Lists...")
    url = "https://ace.unl.edu/courses/listing/"
    ace_map = {f"ace{i}": [] for i in range(1, 11)}
    try:
        res = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(res.content, 'html.parser')
        for i in range(1, 11):
            header = soup.find(lambda tag: tag.name in ['h2', 'h3'] and f"Outcome {i}" in tag.text)
            if header:
                container = header.find_next(['table', 'ul'])
                if container:
                    links = container.find_all('a')
                    ace_map[f"ace{i}"] = sorted(list(set(clean_id(l.get_text()) for l in links if len(l.get_text()) > 4)))
        return ace_map
    except: return ace_map

def get_row_entries(code_td):
    """Pairs courses joined by '&' or 'and' with a '/' (e.g., 'bios101/101l')."""
    links = code_td.find_all('a', class_='bubblelink')
    ids = [clean_id(l.get_text()) for l in links]
    cell_text = code_td.get_text().lower()
    if ('&' in cell_text or 'and' in cell_text) and len(ids) > 1:
        return ["/".join(ids)]
    return ids

def scrape_table_data(url, ace_dict):
    """Parses requirement tables into the list-of-lists-of-lists format."""
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(res.content, 'html.parser')
        
        target_id = "requirementstext" if "#requirementstext" in url else "minortext"
        container = soup.find('div', id=target_id)
        
        tables = container.find_all('table', class_='sc_courselist') if container else soup.find_all('table', class_='sc_courselist')

        all_slots = []
        for table in tables:
            current_slot, is_choice_block = [], False 
            for row in table.find_all('tr'):
                comment = row.find('span', class_='courselistcomment')
                comment_text = comment.get_text().lower() if comment else ""
                
                ace_match = re.search(r'ace\s*(\d+)', comment_text)
                if ace_match:
                    all_slots.append(ace_dict.get(f"ace{ace_match.group(1)}", []))
                    continue

                if comment:
                    if any(x in comment_text for x in ["subtotal", "total"]):
                        if current_slot: all_slots.append(current_slot)
                        current_slot, is_choice_block = [], False
                        continue
                    if any(x in comment_text for x in ["select one", "choose from", "select from", "choice of"]):
                        if current_slot: all_slots.append(current_slot)
                        current_slot, is_choice_block = [], True
                    else:
                        if current_slot: all_slots.append(current_slot)
                        current_slot, is_choice_block = [], False

                code_td = row.find('td', class_='codecol')
                if code_td:
                    is_or = 'orclass' in code_td.get('class', [])
                    row_entries = get_row_entries(code_td)
                    
                    if not is_or and not is_choice_block:
                        if current_slot: all_slots.append(current_slot)
                        current_slot = []
                    
                    for entry in row_entries:
                        if entry not in current_slot: current_slot.append(entry)
                
                elif not comment and not is_choice_block and current_slot:
                    all_slots.append(current_slot)
                    current_slot = []

            if current_slot: all_slots.append(current_slot)
        return [slot for slot in all_slots if slot]
    except: return []

def discover_programs():
    """Finds all Major and Minor URLs from the global UNL undergraduate index."""
    print("Step 2: Discovering all UNL Program URLs...")
    index_url = "https://catalog.unl.edu/undergraduate/majors/"
    programs = {"majors": {}, "minors": {}}
    try:
        res = requests.get(index_url, headers=HEADERS)
        soup = BeautifulSoup(res.content, 'html.parser')
        # Scans the entire list of undergraduate programs
        container = soup.find('div', id='textcontainer') or soup.find('div', id='content')
        
        for a in container.find_all('a', href=True):
            href = a['href']
            text = a.get_text().strip()
            if href.startswith('/undergraduate/') and len(href.split('/')) >= 4:
                clean_name = clean_id(text)
                if "minor" in text.lower():
                    programs["minors"][clean_name] = f"https://catalog.unl.edu{href}#minortext"
                else:
                    programs["majors"][clean_name] = f"https://catalog.unl.edu{href}#requirementstext"
        return programs
    except Exception as e:
        print(f"Discovery Error: {e}")
        return programs

if __name__ == "__main__":
    ace_data = get_ace_dictionary()
    all_programs = discover_programs()
    
    majors_data = {}
    minors_data = {}

    # Scrape Majors
    print(f"\nScraping {len(all_programs['majors'])} Majors...")
    for name, url in all_programs['majors'].items():
        print(f"  Processing Major: {name}")
        data = scrape_table_data(url, ace_data)
        if data: majors_data[name] = data
        time.sleep(0.5)

    # Scrape Minors
    print(f"\nScraping {len(all_programs['minors'])} Minors...")
    for name, url in all_programs['minors'].items():
        print(f"  Processing Minor: {name}")
        data = scrape_table_data(url, ace_data)
        if data: minors_data[name] = data
        time.sleep(0.5)

    # Output to two separate files
    with open('all_unl_majors.json', 'w') as f:
        json.dump(majors_data, f, indent=2)
    
    with open('all_unl_minors.json', 'w') as f:
        json.dump(minors_data, f, indent=2)
    
    print("\nTask Complete! Check 'all_unl_majors.json' and 'all_unl_minors.json'.")