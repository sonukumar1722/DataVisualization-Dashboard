from django.shortcuts import render
from django.http import JsonResponse
from pymongo import MongoClient

# Set up MongoDB connection
client = MongoClient('localhost', 27017)
db = client['mDataBase']
collection = db['data']

# Render the dashboard HTML page
def dashboard(request):
    print("Rendering dashboard")  # Debug log
    return render(request, 'dashboard/index.html')

# Fetch all data
def get_data(request):
    try:
        data = list(collection.find({}, {'_id': 0}))
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# Fetch filtered data based on query parameters
def get_filtered_data(request):
    query = {}

    # Collect query parameters
    end_year = request.GET.get('end_year')
    if end_year:
        query['end_year'] = end_year

    topic = request.GET.get('topic')
    if topic:
        query['topic'] = topic

    sector = request.GET.get('sector')
    if sector:
        query['sector'] = sector

    region = request.GET.get('region')
    if region:
        query['region'] = region

    pest = request.GET.get('pestle')
    if pest:
        query['pestle'] = pest

    source = request.GET.get('source')
    if source:
        query['source'] = source

    swot = request.GET.get('swot')
    if swot:
        query['swot'] = swot

    country = request.GET.get('country')
    if country:
        query['country'] = country

    # Fetch filtered data from the collection
    data = list(collection.find(query, {'_id': 0}))
    return JsonResponse(data, safe=False)
