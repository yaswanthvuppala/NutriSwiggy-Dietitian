import sys
import os
import unittest
from fastapi.testclient import TestClient

# Ensure backend package is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.main import app
from backend.services.food_service import FoodService
from backend.services.gemini_context import format_food_for_gemini, build_gemini_recommendation_prompt


class TestFoodAPI(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)
        self.service = FoodService()

    def test_food_service_db(self):
        foods = self.service.search_foods(query="Bajra", limit=10)
        self.assertGreater(len(foods), 0)
        self.assertIn("Bajra", foods[0]["name"])
        self.assertEqual(foods[0]["code"], "A003")

    def test_get_food_by_code(self):
        response = self.client.get("/foods/A003")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["code"], "A003")
        self.assertEqual(data["name"], "Bajra")
        self.assertEqual(data["food_group"], "Cereals and Millets")
        self.assertIn("Hindi", data["language_names"])
        self.assertIn("nutrients", data)

    def test_search_foods_endpoint(self):
        response = self.client.get("/foods?query=pineapple")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(data["total"], 0)
        self.assertTrue(any("Pineapple" in f["name"] for f in data["foods"]))

    def test_filter_foods_by_nutrient(self):
        response = self.client.get("/foods/filter?nutrient=protein&min=10&limit=10")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(data["total"], 0)
        first_food = data["foods"][0]
        prot_val = first_food["nutrients"]["protein"]["value"]
        self.assertGreaterEqual(prot_val, 10.0)

    def test_gemini_context_formatter(self):
        food = self.service.get_food_by_code("E053")  # Pineapple
        self.assertIsNotNone(food)

        ctx = format_food_for_gemini(food)
        self.assertEqual(ctx["food_code"], "E053")
        self.assertEqual(ctx["food_name"], "Pineapple")
        self.assertIn("macros_per_100g", ctx)

        prompt = build_gemini_recommendation_prompt(food, {"target_calories": 2000, "target_protein": 100})
        self.assertIn("NutriSwiggy", prompt)
        self.assertIn("Pineapple", prompt)

    def test_gemini_context_endpoint(self):
        response = self.client.get("/foods/A003/gemini-context")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["food_code"], "A003")
        self.assertIn("gemini_context", data)
        self.assertEqual(data["gemini_context"]["food_name"], "Bajra")


if __name__ == "__main__":
    unittest.main()
