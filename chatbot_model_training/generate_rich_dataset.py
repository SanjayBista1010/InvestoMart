import random
import csv
import time
import os

print("Initializing rich dataset generation...")

animals_config = {
    "chicken": {"category": "bird", "breeds": ["Leghorn", "Rhode Island Red", "Broiler", "Kuroiler", "Sussex", "Plymouth Rock", "Australorp", "Silkie", "Kadaknath", "Brahma", "Orpington", "Wyandotte"]},
    "ostrich": {"category": "bird", "breeds": ["African Black", "Red Neck", "Blue Neck", "Somali", "Masai", "Southern"]},
    "kalij": {"category": "bird", "breeds": ["White-crested", "Black-backed", "Nepalese Kalij", "Himalayan", "Lophura leucomelanos", "Khaleej"]},
    "duck": {"category": "bird", "breeds": ["Pekin", "Muscovy", "Khaki Campbell", "Runner", "Mallard", "Rouen", "Aylesbury", "Call Duck", "Cayuga", "Crested"]},
    "rabbit": {"category": "mammal", "breeds": ["New Zealand White", "California", "Flemish Giant", "Angora", "Rex", "Dutch", "Lionhead", "Himalayan", "English Lop", "Chinchilla"]},
    "pig": {"category": "mammal", "breeds": ["Yorkshire", "Duroc", "Berkshire", "Hampshire", "Landrace", "Pietrain", "Tamworth", "Saddleback", "Large White", "Chester White"]},
    "cow": {"category": "mammal", "breeds": ["Holstein", "Jersey", "Guernsey", "Angus", "Hereford", "Brahman", "Charolais", "Simmental", "Limousin", "Brown Swiss", "Ayrshire", "Dexter"]},
    "buffalo": {"category": "mammal", "breeds": ["Murrah", "Nili-Ravi", "Surti", "Jafarabadi", "Bhadawari", "Mehsana", "Swamp", "Mediterranean", "Toda", "Pandharpuri"]},
    "goat": {"category": "mammal", "breeds": ["Boer", "Nubian", "Saanen", "Alpine", "LaMancha", "Jamnapari", "Beetal", "Kiko", "Black Bengal", "Khari", "Chyangra", "Sinhal", "Pashmina", "Toggenburg"]}
}

questions_global = [
    "What are the primary characteristics of the {breed} {animal}?",
    "How do you manage feeding and nutrition for commercial {breed} {animal}s?",
    "What is the average expected yield or growth weight of a {breed} {animal}?",
    "Can you detail the ideal housing and environmental requirements for {breed} {animal}s?",
    "What are the most common health issues and diseases in {breed} {animal}s?",
    "Could you explain the breeding cycle and reproduction parameters of the {breed} {animal}?",
    "What is the typical life expectancy and productive lifespan of a {breed} {animal}?",
    "How do you ensure proper biosecurity and hygiene for {breed} {animal} farms?",
    "What is the optimal temperature and humidity range for raising {breed} {animal}s effectively?",
    "Provide comprehensive information on the vaccination and immunization schedule for {breed} {animal}s.",
    "What are the unique behavioral traits observed in the {breed} {animal}?",
    "How can farmers optimize the feed conversion ratio (FCR) for {breed} {animal}s?",
    "What specific infrastructure is required to start a {breed} {animal} farming enterprise?",
    "Discuss the profitability and economic viability of raising {breed} {animal}s on a large scale.",
    "What are the best practices for weaning and early-stage care of {breed} {animal} offspring?"
]

questions_nepal = [
    "How suitable is the {breed} {animal} for agricultural farming in Nepal?",
    "What is the current market demand and economic value for {breed} {animal}s in Nepal?",
    "How does the {breed} {animal} adapt to the diverse and sometimes harsh Nepalese climate?",
    "What are the specific feed availability challenges for {breed} {animal}s in the hilly regions of Nepal?",
    "Is intensive {breed} {animal} farming highly profitable in the Terai region of Nepal?",
    "Where can prospective farmers procure high-quality {breed} {animal} genetics or stock in Nepal?",
    "Are there any government subsidies, insurance, or grants for {breed} {animal} farming in Nepal?",
    "How should Nepalese farmers manage cold stress for {breed} {animal}s during unpredictable Himalayan winters?",
    "Please contrast traditional versus modern commercial approaches to raising {breed} {animal}s in Nepal.",
    "What endemic diseases affect {breed} {animal}s most severely within Nepal's borders?",
    "How lucrative is the Kathmandu valley market for products derived from the {breed} {animal}?",
    "What local Nepalese fodder and forage alternatives can be safely fed to {breed} {animal}s?",
    "How does the altitude in regions like Pokhara or Mustang affect the physiology of the {breed} {animal}?",
    "What are the logistical challenges of transporting {breed} {animal}s across Nepal's mountainous terrain?",
    "Can {breed} {animal} husbandry improve rural livelihoods in marginalized Nepalese communities?"
]

vocab_rich_answers_fragments = {
    "intro": [
        "Fundamentally, ", "To begin with, ", "In agricultural contexts, ", "From a husbandry perspective, ", "According to veterinary standards, ",
        "Historically speaking, ", "In modern commercial operations, ", "As a foundational principle, ", "In terms of livestock management, ", "Empirical data suggests that "
    ],
    "core": [
        "the {breed} {animal} exhibits tremendous resilience and a robust physiological constitution.",
        "meticulous attention to their dietary formulation is imperative for achieving genetic potential.",
        "implementing rigorous biosecurity protocols mitigates the proliferation of virulent pathogens.",
        "producers must meticulously monitor environmental parameters to ensure optimal welfare and yield.",
        "they invariably require a balanced amalgamation of concentrates, roughages, and essential micronutrients.",
        "their exceptional feed conversion efficiency makes them a highly lucrative asset for commercial enterprises.",
        "preventative prophylaxis, including systematic vaccination, drastically curtails mortality rates.",
        "the gestation and incubation phases demand absolute environmental stability and minimal stressors.",
        "superior genetics inherently dictate their morphological traits and subsequent productivity metrics.",
        "adequate ventilation and sophisticated waste management infrastructure are non-negotiable prerequisites."
    ],
    "nepal_core": [
        "Furthermore, navigating the topographical complexities of Nepal requires robust logistical planning.",
        "In the context of the Terai belt, heat stress amelioration is a critical management priority.",
        "Conversely, in the trans-Himalayan zones, insulating infrastructure is vital to prevent hypothermia.",
        "Utilizing indigenous Nepalese forage cultivars can significantly drastically reduce exorbitant feed expenditures.",
        "The burgeoning consumer demographic in metropolitan Kathmandu ensures a lucrative, sustained market trajectory.",
        "However, vulnerability to endemic sub-tropical parasites remains a persistent challenge in the monsoon epoch.",
        "Integration with traditional Nepalese agro-ecological systems augments holistic farm sustainability.",
        "Leveraging decentralized veterinary cooperatives has proven efficacious in rural Nepalese districts.",
        "Governmental subsidization frameworks periodically offset the initial capital expenditure for Nepalese agropreneurs.",
        "Their acclimatization to fluctuating altitudinal gradients in Nepal underscores their remarkable phenotypic plasticity."
    ],
    "outro": [
        " Consequently, proactive management invariably yields exponential dividends.",
        " Ultimately, an integrated approach synchronizing genetics, nutrition, and environment is paramount.",
        " Therefore, continuous education and adherence to contemporary husbandry paradigms are essential.",
        " In summation, optimizing these empirical variables drastically enhances commercial viability.",
        " As such, rigorous daily observation remains the cornerstone of proficient herd or flock management.",
        " Thus, mitigating abiotic stressors directly correlates with maximized profitability algorithms.",
        " Hence, strategic foresight and adaptive agricultural typologies define successful stewardship.",
        " Conclusively, leveraging veterinary diagnostics preemptively is the most pragmatic economic strategy.",
        " This holistic overarching philosophy guarantees both animal welfare and maximum return on investment.",
        " To that end, precision agriculture technologies are increasingly becoming indispensable in this sector."
    ]
}

def generate_row():
    animal = random.choice(list(animals_config.keys()))
    category = animals_config[animal]["category"]
    breed = random.choice(animals_config[animal]["breeds"])
    
    is_nepal = random.random() < 0.25
    
    if is_nepal:
        q_template = random.choice(questions_nepal)
        core_phrase = random.choice(vocab_rich_answers_fragments["core"]) + " " + random.choice(vocab_rich_answers_fragments["nepal_core"])
    else:
        q_template = random.choice(questions_global)
        core_phrase = random.choice(vocab_rich_answers_fragments["core"]) + " " + random.choice(vocab_rich_answers_fragments["core"])
        
    question = q_template.format(breed=breed, animal=animal)
    
    intro = random.choice(vocab_rich_answers_fragments["intro"])
    outro = random.choice(vocab_rich_answers_fragments["outro"])
    
    raw_answer = f"{intro}{core_phrase}{outro}"
    answer = raw_answer.format(breed=breed, animal=animal)
    
    return [animal, breed, category, question, answer]


TARGET_ROWS = 1_000_000
OUTPUT_FILE = "data/livestock_rich_training_data.csv"

os.makedirs("data", exist_ok=True)

print(f"Generating {TARGET_ROWS:,} rows of highly diverse, vocabulary-rich Q&A data...")
start_time = time.time()

with open(OUTPUT_FILE, mode='w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(["animal", "breed", "category", "question", "answer"])
    
    buffer = []
    
    for i in range(1, TARGET_ROWS + 1):
        buffer.append(generate_row())
        
        if i % 50_000 == 0:
            writer.writerows(buffer)
            buffer = []
            elapsed = time.time() - start_time
            print(f"  Processed {i:,}/{TARGET_ROWS:,} rows ({elapsed:.1f}s elapsed)")

# flush any remaining
if buffer:
    writer.writerows(buffer)

total_time = time.time() - start_time
print(f"\nDone! Successfully generated {TARGET_ROWS:,} rich rows in {total_time:.1f} seconds.")
print(f"Saved to: {OUTPUT_FILE}")
