import json
from pymongo import MongoClient
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Load data from jsondata.json into MongoDB'

    def handle(self, *args, **kwargs):
        # Connect to MongoDB
        client = MongoClient('localhost', 27017)  # Update if MongoDB is hosted elsewhere
        db = client['mDataBase']
        collection = db['data']  # The collection where data will be stored

        # Load JSON data from the file, using utf-8 encoding
        with open(r'dashboard\management\commands\jsondata.json', encoding='utf-8') as file:
            data = json.load(file)
            # Insert the data into MongoDB
            collection.insert_many(data)

            # Generate unique values for SWOT and City
            unique_swot = ['Strengths', 'Weaknesses', 'Opportunities', 'Threats']
            unique_cities = set(item.get('city', 'Unknown') for item in data)

            # Optional: Insert or update documents with SWOT and City values
            for entry in data:
                # Assign a random SWOT category for demonstration
                entry['swot'] = unique_swot[0]  # Example: Assigning 'Strengths'
                # If your city is not directly available, you may need logic to assign it.
                entry['city'] = entry.get('city', 'Unknown')  # Placeholder for cities

            # Reinsert the updated data with SWOT and City
            collection.delete_many({})  # Clear existing data
            collection.insert_many(data)  # Insert the updated data with new fields

        print(f'{len(data)} records inserted into MongoDB.')
        print(f'Unique SWOT categories: {unique_swot}')
        print(f'Unique Cities: {unique_cities}')
