import random
import csv
import time
import os

print("Initializing rich paragraph dataset generation...")

# User requested: birds: chicken, ostrich, kalij, duck
# mammals: rabbit, pig, cow, buffalo, goat
animals_config = {
    "chicken": {"category": "bird", "breeds": ["Leghorn", "Rhode Island Red", "Broiler", "Kuroiler", "Sussex", "Plymouth Rock", "Australorp", "Silkie", "Kadaknath", "Brahma", "Orpington", "Wyandotte", "Cornish"]},
    "ostrich": {"category": "bird", "breeds": ["African Black", "Red Neck", "Blue Neck", "Somali", "Masai", "Southern"]},
    "kalij": {"category": "bird", "breeds": ["White-crested", "Black-backed", "Nepalese Kalij", "Himalayan", "Lophura leucomelanos", "Khaleej"]},
    "duck": {"category": "bird", "breeds": ["Pekin", "Muscovy", "Khaki Campbell", "Runner", "Mallard", "Rouen", "Aylesbury", "Call Duck", "Cayuga", "Crested", "Indian Runner"]},
    "rabbit": {"category": "mammal", "breeds": ["New Zealand White", "California", "Flemish Giant", "Angora", "Rex", "Dutch", "Lionhead", "Himalayan", "English Lop", "Chinchilla"]},
    "pig": {"category": "mammal", "breeds": ["Yorkshire", "Duroc", "Berkshire", "Hampshire", "Landrace", "Pietrain", "Tamworth", "Saddleback", "Large White", "Chester White"]},
    "cow": {"category": "mammal", "breeds": ["Holstein", "Jersey", "Guernsey", "Angus", "Hereford", "Brahman", "Charolais", "Simmental", "Limousin", "Brown Swiss", "Ayrshire", "Dexter", "Siri", "Pahari"]},
    "buffalo": {"category": "mammal", "breeds": ["Murrah", "Nili-Ravi", "Surti", "Jafarabadi", "Bhadawari", "Mehsana", "Swamp", "Mediterranean", "Toda", "Pandharpuri", "Lime", "Parkote"]},
    "goat": {"category": "mammal", "breeds": ["Boer", "Nubian", "Saanen", "Alpine", "LaMancha", "Jamnapari", "Beetal", "Kiko", "Black Bengal", "Khari", "Chyangra", "Sinhal", "Pashmina", "Toggenburg"]}
}

q_templates_global = [
    "Could you provide a detailed overview of managing a {breed} {animal} farm?",
    "What are the comprehensive dietary, spatial, and veterinary requirements for the {breed} {animal}?",
    "Please elaborate on the growth rate, yield potential, and economic viability of raising {breed} {animal}s.",
    "Can you outline the optimal environmental conditions and the necessary infrastructure for {breed} {animal} husbandry?",
    "What specific disease prevention strategies and vaccination regimens are critical for a healthy {breed} {animal} flock or herd?",
    "Discuss in detail the breeding cycle, gestational parameters, and reproductive management of the {breed} {animal}.",
    "From a commercial perspective, how do you maximize the feed conversion ratio and overall productivity of the {breed} {animal}?",
    "What are the defining morphological characteristics and behavioral idiosyncrasies unique to the {breed} {animal}?",
]

q_templates_nepal = [
    "How suitable is the {breed} {animal} for integration into traditional and modern Nepalese agricultural systems?",
    "What are the specific climatic challenges and feed availability considerations when raising the {breed} {animal} in the hilly regions of Nepal?",
    "Can you detail the economic potential and local market demand for {breed} {animal} products within the Kathmandu Valley and surrounding areas?",
    "How should Nepalese farmers modify their husbandry practices to protect the {breed} {animal} from severe altitudinal variations and winter cold stress?",
    "Discuss the endemic diseases affecting the {breed} {animal} in the Terai region of Nepal and how local farmers mitigate these threats.",
]

# Paragraph generation components
fragments_global = {
    "sentence1": [
        "The {breed} {animal} represents a cornerstone of modern agricultural enterprises due to its inherent resilience and exceptional productivity.",
        "Fundamentally, raising the {breed} {animal} necessitates a meticulous approach balancing nutritional science, environmental control, and proactive veterinary care.",
        "When managing commercial operations focused on the {breed} {animal}, one must first comprehend its unique physiological demands and high growth trajectory.",
        "The overarching philosophy of {breed} {animal} husbandry centers around mitigating abiotic stressors to ensure the animals function near peak genetic potential.",
        "Renowned globally for their adaptability, {breed} {animal} cohorts thrive when housed in sophisticated, climate-controlled infrastructure."
    ],
    "sentence2": [
        "Optimizing the feed conversion ratio requires a dense amalgamation of carbohydrates, essential amino acids, and tailored micronutrient concentrates.",
        "Stringent biosecurity protocols, including rigorous isolation of incoming stock and prophylactic vaccination, are absolutely non-negotiable to prevent catastrophic pathogenic outbreaks.",
        "To sustain an economically viable enterprise, producers construct ventilated housing architectures that regulate systemic humidity and ambient temperature.",
        "Their reproductive cycle demands absolute environmental stability; thus, minimizing external anthropogenic disturbances during critical gestational phases is imperative.",
        "A rigorous empirical analysis of their daily caloric intake reveals that precisely calibrated forage-to-concentrate ratios exponentially elevate yield outcomes."
    ],
    "sentence3": [
        "Furthermore, ensuring ad libitum access to uncontaminated water dramatically augments their metabolic digestion and overall physiological throughput.",
        "Consequently, integrating advanced sensor technologies for continuous health monitoring has become a ubiquitous standard in managing this specific breed.",
        "Indeed, preemptive diagnostic veterinary screenings circumvent the substantial financial detriments associated with acute endemic diseases.",
        "From an ethological perspective, allowing structured foraging or pasture rotation heavily stimulates their innate behavioral repertoires, reducing physiological cortisol.",
        "Subsequently, the implementation of photoperiod manipulation can actively stimulate greater reproductive hormonal activity and accelerated maturation."
    ],
    "sentence4": [
        "In summation, adhering strictly to these meticulously developed protocols guarantees a robust, thriving population capable of maximizing gross profit margins.",
        "Ultimately, the synthesis of superior genetic selection with immaculate husbandry techniques is the definitive blueprint for sustained agricultural success.",
        "Therefore, continuous refinement of management paradigms remains essential to safeguard both animal welfare and long-term commercial sustainability.",
        "Hence, astute farmers prioritize preventative care over retroactive treatments to cement the foundation of a highly lucrative operation.",
        "As such, maintaining a disciplined adherence to these scientific methodologies inevitably results in unparalleled consistency and superior agricultural outputs."
    ]
}

fragments_nepal = {
    "sentence1": [
        "In the context of Nepal's diverse topographical constraints, the {breed} {animal} demonstrates remarkable phenotypic plasticity across varying altitudinal gradients.",
        "When introducing the {breed} {animal} to Nepalese agro-ecological systems, farmers must prioritize acclimatization strategies to offset the severe sub-tropical monsoon impacts.",
        "The integration of the {breed} {animal} into the rural agrarian economy of Nepal has been catalyzed by surging domestic demand within metropolitan hubs like Kathmandu.",
        "Given the often fragmented landholdings in the Nepalese mid-hills, intensive management of the {breed} {animal} offers a pragmatic vertical scaling opportunity.",
        "In the sweeping plains of the Terai, the {breed} {animal} is increasingly recognized as a vital component for diversifying smallholder farm revenue streams."
    ],
    "sentence2": [
        "A primary logistical hurdle remains the procurement of high-quality concentrate feeds, necessitating the innovative utilization of indigenous Nepalese forage cultivars.",
        "Furthermore, navigating the formidable Himalayan winter requires robust insulating infrastructure to shield the stock from precipitous hypothermic exposure.",
        "During the formidable monsoon epoch, susceptibility to endemic parasitic loads sharply increases, commanding rigorous anthelmintic and prophylactic interventions.",
        "Governmental subsidization frameworks and decentralized cooperative networks periodically alleviate the exorbitant initial capital expenditure required for sophisticated housing.",
        "To circumvent exorbitant imported feed costs, astute local producers supplement diets with indigenous agricultural byproducts like locally milled maize and mustard cake."
    ],
    "sentence3": [
        "Moreover, establishing dependable supply chain logistics traversing Nepal's precarious mountainous terrain is indispensable for preserving product viability.",
        "In regions such as Pokhara and Chitwan, agrotourism integration has synthetically amplified the intrinsic value proposition of maintaining premium quality herds or flocks.",
        "Consequently, leveraging indigenous ethnoveterinary practices alongside modern pharmacological treatments has proven highly efficacious in isolated rural districts.",
        "The localized microclimates intricately affect their metabolic rates, which implies that dietary compositions must be seasonally recalibrated to maintain optimal body condition scores.",
        "Additionally, the deployment of elevated slatted flooring has become a widespread local adaptation to mitigate extreme moisture accumulation during torrential rains."
    ],
    "sentence4": [
        "Ultimately, synchronizing modern scientific husbandry with traditional indigenous knowledge empowers Nepalese agriculturalists to achieve unprecedented commercial resilience.",
        "In closing, overcoming the inherent infrastructural impediments of Nepal translates the theoretical potential of this breed into a tangible, lucrative reality.",
        "Therefore, targeted investments in localized veterinary outreach and resilient housing will inevitably secure the long-term sustainability of this sector.",
        "Thus, embracing flexible, highly adaptive management paradigms guarantees that localized farming practices remain both ecologically sound and exceptionally profitable.",
        "Conclusively, the intersection of specialized genetic rearing and proactive state support signifies a highly promising trajectory for Nepal's advancing agricultural landscape."
    ]
}

def build_paragraph(breed, animal, is_nepal):
    s1 = random.choice(fragments_nepal["sentence1"] if is_nepal else fragments_global["sentence1"])
    s2 = random.choice(fragments_nepal["sentence2"] if is_nepal else fragments_global["sentence2"])
    s3 = random.choice(fragments_nepal["sentence3"] if is_nepal else fragments_global["sentence3"])
    s4 = random.choice(fragments_nepal["sentence4"] if is_nepal else fragments_global["sentence4"])
    
    para = f"{s1} {s2} {s3} {s4}"
    return para.format(breed=breed, animal=animal)

TARGET_ROWS = 1_000_000
OUTPUT_FILE = "data/livestock_rich_paragraphs.csv"

os.makedirs("data", exist_ok=True)

print(f"Generating {TARGET_ROWS:,} paragraphs of rich Q&A data...")
start_time = time.time()

with open(OUTPUT_FILE, mode='w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(["animal", "breed", "category", "question", "answer"])
    
    buffer = []
    
    for i in range(1, TARGET_ROWS + 1):
        animal = random.choice(list(animals_config.keys()))
        category = animals_config[animal]["category"]
        breed = random.choice(animals_config[animal]["breeds"])
        
        # 75% General / 25% Nepal
        is_nepal = random.random() < 0.25
        
        if is_nepal:
            q_template = random.choice(q_templates_nepal)
        else:
            q_template = random.choice(q_templates_global)
            
        question = q_template.format(breed=breed, animal=animal)
        answer = build_paragraph(breed, animal, is_nepal)
        
        buffer.append([animal, breed, category, question, answer])
        
        if i % 100_000 == 0:
            writer.writerows(buffer)
            buffer = []
            elapsed = time.time() - start_time
            print(f"  Processed {i:,}/{TARGET_ROWS:,} rows ({elapsed:.1f}s elapsed)")

if buffer:
    writer.writerows(buffer)

print(f"\nDone! Successfully generated {TARGET_ROWS:,} rich paragraph rows in {time.time() - start_time:.1f} seconds.")
print(f"Saved to: {OUTPUT_FILE}")
