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

    course_blocks = soup.find_all('div', class_='courseblock')

    for block in course_blocks:
        subj_span = block.find('span', class_='cb_subject_code')
        num_span = block.find('span', class_='cb_course_number')
        
        if subj_span and num_span:
            raw_id = f"{subj_span.get_text()} {num_span.get_text()}"
            course_id = clean_string(raw_id)
        else:
            continue

        # Extract Title
        title_span = block.find('span', class_='title')
        title = title_span.get_text().strip() if title_span else "Unknown Title"

        # Extract Prerequisites
        prereq_div = block.find('div', class_='cb_prereqs')
        prereqs_list = []
        if prereq_div:
            prereq_links = prereq_div.find_all('a', class_='bubblelink')
            for link in prereq_links:
                prereqs_list.append(clean_string(link.get_text()))
            
            if not prereqs_list:
                text = prereq_div.get_text()
                matches = re.findall(r'([A-Z]{4}\s\d{3}[A-Z]?)', text)
                prereqs_list = [clean_string(m) for m in matches]

        # Extract Credit Hours
        credits = "0"
        details_table = block.find('table', class_='cb_details')
        if details_table:
            for row in details_table.find_all('tr'):
                if 'Credit Hours:' in row.get_text():
                    credits = row.find('td').get_text().strip()

        course_data = {
            "id": course_id,
            "title": title,
            "prerequisites": prereqs_list,
            "credits": credits
        }
        courses.append(course_data)

    return courses

if __name__ == "__main__":
    target_depts = ["ACCT", "ADPR", "AECN", "AGEN", "AGRI", "AGRO", "ALEC", "ANTH", "ARAB", "ARCH", 
    "ARTP", "ASCI", "ASTR", "BIOS", "BLAS", "BSAD", "BSEN", "CHME", "CHEM", "CHIN", 
    "CIVE", "CLAS", "COMM", "CONE", "CRIM", "CSCE", "CYAF", "DSGN", "ECON", "EDAD", 
    "EDPS", "EMGT", "ENGL", "ENGR", "ENTO", "ETHN", "FDST", "FINA", "FREN", "GEOG", 
    "GEOL", "GERM", "GIST", "GRPH", "GREK", "HIST", "HORT", "HRTM", "HUMA", "IDES", 
    "IECC", "IMM", "ITAL", "JAPN", "JOMC", "JOUR", "LARC", "LATN", "LAW", "LIFE", 
    "MATH", "MECH", "METR", "MNGT", "MODL", "MRKT", "MSYM", "MUDC", "MUED", "MUNM", 
    "MUSC", "NRES", "NUTR", "PHIL", "PHYS", "POLS", "PSYC", "RAIK", "RELS", "RUSS", 
    "SCMS", "SOCI", "SOFT", "SPAN", "SPED", "STAT", "TEAC", "THEA", "UHON", "WMNS"] 
    
    all_results = []
    for dept in target_depts:
        dept_courses = parse_unl_catalog(dept)
        all_results.extend(dept_courses)

    with open('all_unl_classes.json', 'w') as f:
        json.dump(all_results, f, indent=2)
    
