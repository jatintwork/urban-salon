from django.core.management.base import BaseCommand
from company_services.models import ServiceCategory, Service


class Command(BaseCommand):
    help = "Dump initial service data into ServiceCategory and Service models"

    def handle(self, *args, **kwargs):
        # Sample data to be dumped
        services_data = {
    "Clean Up": {
        "description": "Deep cleansing treatments that refresh and hydrate the skin, ideal for instant glow and rejuvenation.",
        "services": [
            {"name": "VLCC Fruit Clean Up", "price": 449, "duration": 40,
             "description": "A refreshing fruit-based clean-up that deeply cleanses and hydrates the skin."},
            {"name": "VLCC Insta Glow", "price": 449, "duration": 40,
             "description": "Quick glow treatment to brighten your skin instantly before any occasion."},
        ]
    },

    "Waxing": {
        "description": "A range of waxing options using honey, Rica, and chocolate roll-on wax for smooth, soft, and nourished skin.",
        "services": [
            {"name": "Full Arm + Underarm Waxing (Honey)", "price": 249, "duration": 30,
             "description": "Gentle honey wax for smooth arms and underarms."},
            {"name": "Full Arm + Underarm Waxing (Rica)", "price": 499, "duration": 30,
             "description": "Premium Rica wax for sensitive skin, reduces tan and irritation."},
            {"name": "Full Arm + Underarm Waxing (Chocolate Roll-on)", "price": 449, "duration": 30,
             "description": "Chocolate roll-on wax for soft, glowing arms and underarms."},

            {"name": "Full Legs Waxing (Honey)", "price": 299, "duration": 30,
             "description": "Affordable honey wax for silky smooth legs."},
            {"name": "Full Legs Waxing (Rica)", "price": 499, "duration": 30,
             "description": "Rica wax for smooth legs with less pain and reduced ingrowth."},
            {"name": "Full Legs Waxing (Chocolate Roll-on)", "price": 449, "duration": 30,
             "description": "Chocolate wax that nourishes skin while removing hair."},

            {"name": "Back Waxing (Honey)", "price": 349, "duration": 15,
             "description": "Quick back waxing using honey wax for smooth results."},
            {"name": "Back Waxing (Rica)", "price": 399, "duration": 15,
             "description": "Rica back waxing ideal for sensitive skin."},
            {"name": "Back Waxing (Chocolate Roll-on)", "price": 449, "duration": 15,
             "description": "Chocolate wax roll-on for painless and nourishing back waxing."},

            {"name": "Stomach Waxing (Honey)", "price": 249, "duration": 15,
             "description": "Honey wax to gently remove stomach hair."},
            {"name": "Stomach Waxing (Rica)", "price": 349, "duration": 15,
             "description": "Stomach waxing with Rica wax, safe for all skin types."},
            {"name": "Stomach Waxing (Chocolate Roll-on)", "price": 449, "duration": 15,
             "description": "Chocolate roll-on wax that smoothens and nourishes stomach skin."},

            {"name": "Bikini Waxing (Honey)", "price": 699, "duration": 30,
             "description": "Honey wax bikini waxing for a clean and hygienic finish."},
            {"name": "Bikini Waxing (Rica Peel-off)", "price": 999, "duration": 30,
             "description": "Rica peel-off wax designed for sensitive bikini area."},

            {"name": "Bikini Line Waxing (Honey)", "price": 199, "duration": 15,
             "description": "Honey wax for clean bikini line shaping."},
            {"name": "Bikini Line Waxing (Rica Peel-off)", "price": 199, "duration": 15,
             "description": "Gentle Rica peel-off wax for bikini line hair removal."},

            {"name": "Full Body Waxing (Honey)", "price": 1149, "duration": 90,
             "description": "Full body waxing with honey wax for smooth skin all over."},
            {"name": "Full Body Waxing (Rica)", "price": 1499, "duration": 90,
             "description": "Premium Rica full body waxing – painless and skin-friendly."},
            {"name": "Full Body Waxing (Chocolate Roll-on)", "price": 1249, "duration": 90,
             "description": "Chocolate wax full body treatment for soft, glowing skin."},
        ]
    },

    "Threading": {
        "description": "Precise and gentle threading services to shape eyebrows, remove facial hair, and define facial contours.",
        "services": [
            {"name": "Eyebrows", "price": 30, "duration": 10,
             "description": "Precise eyebrow shaping for a neat look."},
            {"name": "Forehead", "price": 40, "duration": 10,
             "description": "Removes fine hair from forehead for smooth skin."},
            {"name": "Full Face Wax", "price": 129, "duration": 20,
             "description": "Complete face wax for a clean, polished look."},
            {"name": "Side Lock", "price": 29, "duration": 10,
             "description": "Side lock threading for a clean face contour."},
            {"name": "Upper Lips", "price": 29, "duration": 10,
             "description": "Removes unwanted upper lip hair gently."},
            {"name": "Neck Threading", "price": 99, "duration": 10,
             "description": "Threading for smooth neck area."},
            {"name": "Jawline", "price": 59, "duration": 10,
             "description": "Defines jawline with clean threading."},
            {"name": "Chin", "price": 29, "duration": 10,
             "description": "Removes hair from chin area."},
        ]
    },

    "Bleach & Detan": {
        "description": "Skin lightening and detanning treatments that restore natural glow and remove dullness.",
        "services": [
            {"name": "Face & Neck", "price": 249, "duration": 20,
             "description": "Bleach and detan for face and neck, brightens skin tone."},
            {"name": "Full Arms", "price": 299, "duration": 20,
             "description": "Removes tan and lightens arms for an even look."},
            {"name": "Full Legs", "price": 379, "duration": 35,
             "description": "Detan and bleach for legs, restores natural glow."},
            {"name": "Back", "price": 249, "duration": 30,
             "description": "Back bleach and detan for clear, even-toned skin."},
            {"name": "Full Body + Face + Neck", "price": 999, "duration": 110,
             "description": "Complete body bleach and detan for instant brightness."},
        ]
    },

    "Facial": {
        "description": "Premium facials using O3+ and Lotus products for radiant, hydrated, and glowing skin.",
        "services": [
            {"name": "O3+ Shine and Glow", "price": 1149, "duration": 60,
             "description": "O3+ shine and glow facial for radiant skin."},
            {"name": "O3+ Bridal Facial", "price": 1649, "duration": 100,
             "description": "Special bridal facial with O3+ products for a wedding-ready glow."},
            {"name": "Lotus Pearl Facial", "price": 679, "duration": 60,
             "description": "Lotus pearl facial for smooth, radiant, and bright skin."},
            {"name": "Lotus Gold Facial", "price": 699, "duration": 60,
             "description": "Lotus gold facial to rejuvenate and add a golden glow."},
        ]
    },
}

     
        for category_name, category_data in services_data.items():
            # Create or get category
            category, _ = ServiceCategory.objects.get_or_create(
                name=category_name,
                defaults={"description": category_data.get("description", ""), "image": None}
            )

            # Add services under this category
            for svc in category_data["services"]:
                service, created = Service.objects.get_or_create(
                    category=category,
                    name=svc["name"],
                    defaults={
                        "price": svc.get("price", 0),
                        "duration_minutes": svc.get("duration", 30),  # fixed: use "duration" key from your data
                        "description": svc.get("description", ""),
                        "precaution": svc.get("precaution", ""),
                        "new_location": svc.get("new_location", ""),
                        "image": None,
                    },
                )
                if not created:
                    # Update existing service fields
                    service.price = svc.get("price", service.price)
                    service.duration_minutes = svc.get("duration", service.duration_minutes)
                    service.description = svc.get("description", service.description)
                    service.precaution = svc.get("precaution", service.precaution)
                    service.new_location = svc.get("new_location", service.new_location)
                    service.save(update_fields=["price", "duration_minutes", "description", "precaution", "new_location"])
        self.stdout.write(self.style.SUCCESS("Successfully dumped initial service data into ServiceCategory and Service models."))