import requests
from bs4 import BeautifulSoup
import re
import json

def clean_string(text):
    """Lowercases and removes all whitespace as requested."""
    if not text:
        return ""
    return re.sub(r'\s+', '', text).lower()

def parse_unl_catalog(subject_code):
    # The URL pattern for undergraduate courses
    url = f"https://catalog.unl.edu/undergraduate/courses/{subject_code.lower()}/"
    print(f"Fetching courses for {subject_code} from {url}...")
    
    try:
        response = requests.get(url)
        response.raise_for_status()
    except Exception as e:
        print(f"Error fetching page: {e}")
        return []

    soup = BeautifulSoup(response.content, 'html.parser')
    courses = []

    # Target the 'courseblock' div from your example
    course_blocks = soup.find_all('div', class_='courseblock')

    for block in course_blocks:
        # 1. Extract Course ID (e.g., CSCE 101L)
        # We find the subject and number spans separately
        subj_span = block.find('span', class_='cb_subject_code')
        num_span = block.find('span', class_='cb_course_number')
        
        if subj_span and num_span:
            raw_id = f"{subj_span.get_text()} {num_span.get_text()}"
            course_id = clean_string(raw_id)
        else:
            continue

        # 2. Extract Title
        title_span = block.find('span', class_='title')
        title = title_span.get_text().strip() if title_span else "Unknown Title"

        # 3. Extract Prerequisites
        prereq_div = block.find('div', class_='cb_prereqs')
        prereqs_list = []
        if prereq_div:
            # Look for <a> tags which usually contain the course links
            prereq_links = prereq_div.find_all('a', class_='bubblelink')
            for link in prereq_links:
                prereqs_list.append(clean_string(link.get_text()))
            
            # Fallback: If no links, use regex to find codes in the text
            if not prereqs_list:
                text = prereq_div.get_text()
                # Regex looks for 4 letters followed by 3-4 digits/letters
                matches = re.findall(r'([A-Z]{4}\s\d{3}[A-Z]?)', text)
                prereqs_list = [clean_string(m) for m in matches]

        # 4. Extract Credit Hours
        # Found inside the 'cb_details' table in your example
        credits = "0"
        details_table = block.find('table', class_='cb_details')
        if details_table:
            for row in details_table.find_all('tr'):
                if 'Credit Hours:' in row.get_text():
                    credits = row.find('td').get_text().strip()

        # Build the final course object
        course_data = {
            "id": course_id,
            "title": title,
            "prerequisites": prereqs_list,
            "credits": credits
        }
        courses.append(course_data)

    return courses

# --- RUN THE SCRIPT ---
if __name__ == "__main__":
    # You can expand this list to include MATH, SOFT, etc.
    target_depts = ["CSCE"] 
    
    all_results = []
    for dept in target_depts:
        dept_courses = parse_unl_catalog(dept)
        all_results.extend(dept_courses)

    # Print the results in a pretty format
    print("\n--- SCRAPED COURSES ---")
    print(json.dumps(all_results, indent=2))
    
    # Optional: Save to file for your DTO/Backend
    # with open('courses.json', 'w') as f:
    #     json.dump(all_results, f)