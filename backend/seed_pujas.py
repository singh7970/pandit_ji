import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.puja import Puja

DATABASE_URL = "postgresql://postgres:singh%407970@localhost:5432/pandit_ji"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Clear existing entries to prevent duplication
db.query(Puja).delete()

default_pujas = [
    Puja(
        id=uuid.uuid4(),
        name_en="Ganesh Puja",
        name_hi="गणेश पूजा",
        description="Ganesh Puja is performed to invoke the blessings of Lord Ganesha, the remover of obstacles, before starting any new venture, business, or auspicious event. It brings prosperity, wisdom, and success.",
        duration_hrs=1.5,
        base_price=1100,
        tier_required="VERIFIED",
        samagri_list=["Ganesh Idol/Photo", "Flowers", "Coconut", "Betel Leaves", "Supari", "Incense Sticks", "Kumkum", "Haldi", "Modak/Sweets"],
        deity="Lord Ganesha",
        occasion_tags=["New Venture", "Inauguration", "Festival", "General"],
        image_url="https://images.unsplash.com/photo-1609137144813-2144dd92d2b4?w=500&auto=format&fit=crop&q=60"
    ),
    Puja(
        id=uuid.uuid4(),
        name_en="Satyanarayan Puja",
        name_hi="सत्यनारायण पूजा",
        description="Satyanarayan Puja is a ritual dedicated to Lord Vishnu in his benevolent form as Lord Satyanarayan. It is performed for health, wealth, peace, and overall well-being of the family.",
        duration_hrs=2.5,
        base_price=2100,
        tier_required="VERIFIED",
        samagri_list=["Satyanarayan Photo", "Banana Leaves", "Panchamrut", "Fruits", "Flowers", "Kalash", "Wheat/Rice", "Desi Ghee", "Suji Halwa for Prasad"],
        deity="Lord Vishnu",
        occasion_tags=["House Warming", "Marriage", "Anniversary", "Monthly"],
        image_url="https://images.unsplash.com/photo-1621873138379-994df525164d?w=500&auto=format&fit=crop&q=60"
    ),
    Puja(
        id=uuid.uuid4(),
        name_en="Griha Pravesh Puja",
        name_hi="गृह प्रवेश पूजा",
        description="Griha Pravesh Puja is performed before moving into a new house to purify the environment and protect the home from negative energies. It invites positive vibes and divine protection.",
        duration_hrs=3.0,
        base_price=5100,
        tier_required="SILVER",
        samagri_list=["Mango Leaves", "Havan Kund", "Havan Samagri", "Gangajal", "Panchadhatu", "New Clay Pot", "Milk", "Coconut", "Flowers", "Toran"],
        deity="Vastu Purush & Goddess Laxmi",
        occasion_tags=["New House", "House Warming"],
        image_url="https://images.unsplash.com/photo-1585909693682-7577dfb8a62e?w=500&auto=format&fit=crop&q=60"
    ),
    Puja(
        id=uuid.uuid4(),
        name_en="Maha Mrityunjaya Jaap",
        name_hi="महामृत्युंजय जाप",
        description="Maha Mrityunjaya Jaap is dedicated to Lord Shiva and is chanted for longevity, healing, protection from serious illness, and spiritual rejuvenation.",
        duration_hrs=4.0,
        base_price=11000,
        tier_required="GOLD",
        samagri_list=["Shiva Lingam/Photo", "Rudraksha Mala", "Bilva Leaves", "Honey", "Milk", "Black Sesame Seeds", "Kusha Grass", "Havan Wood"],
        deity="Lord Shiva",
        occasion_tags=["Health Recovery", "Longevity", "Protection"],
        image_url="https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=500&auto=format&fit=crop&q=60"
    ),
    Puja(
        id=uuid.uuid4(),
        name_en="Laxmi Kuber Puja",
        name_hi="लक्ष्मी कुबेर पूजा",
        description="Laxmi Kuber Puja is performed to worship Goddess Laxmi (Goddess of Wealth) and Lord Kuber (Treasurer of Gods) to remove financial difficulties and invite abundance.",
        duration_hrs=2.0,
        base_price=3100,
        tier_required="SILVER",
        samagri_list=["Laxmi & Kuber Photo", "Gold/Silver Coins", "Lotus Flowers", "Kamalgatta Mala", "Red Cloth", "Saffron", "Perfume", "Kheer for Prasad"],
        deity="Goddess Laxmi & Lord Kuber",
        occasion_tags=["Diwali", "Business Growth", "Dhanteras"],
        image_url="https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=500&auto=format&fit=crop&q=60"
    )
]

for puja in default_pujas:
    db.add(puja)

db.commit()
print("Successfully seeded database with default Pujas!")
db.close()
