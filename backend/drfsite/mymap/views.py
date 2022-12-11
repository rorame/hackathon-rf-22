from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Incident
from .serializers import IncidentSerializer

import requests as requests
from bs4 import BeautifulSoup

from natasha import (
    MorphVocab,
    AddrExtractor,
)


morph_vocab = MorphVocab()
addr_extractor = AddrExtractor(morph_vocab)


def get_coodrinates_by_terrain(terrain):
    try:
        request = requests.get('https://nominatim.openstreetmap.org/search?q=' + terrain + '&format=json')
        if request.status_code == 200:
            # return [request.json()[0]["lat"], request.json()[0]["lon"]]
            return request.json()[0]["lat"] + ", " + request.json()[0]["lon"]
    except:
        return None


def get_location_from_text(text):
    result = addr_extractor.find(text)
    if result is not None:
        return get_coodrinates_by_terrain(str(result).split("value='")[1].split("'")[0])
    return None


def get_incidents_from_rio_news():

    incidents = []

    website_url = requests.get('https://ria.ru/incidents/').text
    soup = BeautifulSoup(website_url, "html.parser")

    titles = soup.findAll('a', {'class': 'list-item__title'}, href=True)
    articles_hrefs = list(map(lambda x: x['href'], titles))

    # print()
    print("Get incidents from rio news:")
    for x in range(len(articles_hrefs)):
        print(str(x + 1) + "/" + str(len(articles_hrefs)))

        sub_website_url = requests.get(articles_hrefs[x]).text
        sub_soup = BeautifulSoup(sub_website_url, "html.parser")
        title = sub_soup.find("div", class_="article__header").select('.article__title')[0].text
        description = "".join(
            list(map(lambda x: x.text, sub_soup.find("div", class_="article__body").select('.article__text'))))
        location = get_location_from_text(title)
        cataclysmic_type = "Пожар"  # Пока заглушка TODO нужно реализовать нейросетку которая будет определять тип катаклизма

        if location is not None:
            incident = {"title": title, 'description': description, 'location': location,
                                'cataclysmic_type': cataclysmic_type, 'src': articles_hrefs[x]}

            incidents.append(incident)

    return incidents


def get_incidents_from_kommersant():

    incidents = []

    website_url = requests.get('https://www.kommersant.ru/rubric/6?from=burger').text
    soup = BeautifulSoup(website_url, "html.parser")

    titles = soup.findAll('a', {'class': 'uho__link uho__link--overlay'}, href=True)
    articles_hrefs = list(map(lambda x: "https://www.kommersant.ru" + x['href'], titles))

    # print()
    print("Get incidents from kommersant:")
    for x in range(len(articles_hrefs)):
        print(str(x + 1) + "/" + str(len(articles_hrefs)))

        sub_website_url = requests.get(articles_hrefs[x]).text
        sub_soup = BeautifulSoup(sub_website_url, "html.parser")
        title = sub_soup.find("h1", class_="doc_header__name js-search-mark").text.strip()
        description = "".join(
            list(map(lambda x: x.text.strip(), sub_soup.find("p", class_="doc__text"))))
        location = get_location_from_text(title)
        cataclysmic_type = "Пожар"  # Пока заглушка TODO нужно реализовать нейросетку которая будет определять тип катаклизма

        if location is not None:
            incident = {"title": title, 'description': description, 'location': location,
                        'cataclysmic_type': cataclysmic_type, 'src': articles_hrefs[x]}

            incidents.append(incident)

    return incidents


def get_incidents_from_kp():

    incidents = []

    website_url = requests.get('https://www.kp.ru/incidents/').text
    soup = BeautifulSoup(website_url, "html.parser")

    titles = soup.findAll('a', {'class': 'sc-1tputnk-2'}, href=True)
    articles_hrefs = list(map(lambda x: "https://www.nsk.kp.ru" + x['href'], titles))

    # print()
    print("Get incidents from KP:")
    for x in range(len(articles_hrefs)):
        print(str(x + 1) + "/" + str(len(articles_hrefs)))

        sub_website_url = requests.get(articles_hrefs[x]).text
        sub_soup = BeautifulSoup(sub_website_url, "html.parser")
        title = sub_soup.find("h1", class_="sc-j7em19-3").text.strip()
        description = "".join(
            list(map(lambda x: x.text.strip(), sub_soup.find("p", class_="sc-1wayp1z-16"))))
        location = get_location_from_text(title)
        cataclysmic_type = "Пожар"  # Пока заглушка TODO нужно реализовать нейросетку которая будет определять тип катаклизма

        if location is not None:
            incident = {"title": title, 'description': description, 'location': location,
                        'cataclysmic_type': cataclysmic_type, 'src': articles_hrefs[x]}

            incidents.append(incident)

    return incidents


def get_incidents_from_lenta():

    incidents = []

    website_url = requests.get('https://lenta.ru/rubrics/russia/accident/').text
    soup = BeautifulSoup(website_url, "html.parser")
    titles = soup.findAll('a', {'class': 'card-full-news _subrubric'}, href=True)
    articles_hrefs = list(map(lambda x: "https://lenta.ru/" + x['href'], titles))

    print()
    print("Get incidents from lenta:")
    for x in range(len(articles_hrefs)):
        print(str(x + 1) + "/" + str(len(articles_hrefs)))

        sub_website_url = requests.get(articles_hrefs[x]).text
        sub_soup = BeautifulSoup(sub_website_url, "html.parser")
        title = sub_soup.find("span", class_="topic-body__title").text.strip()
        description = "".join(
            list(map(lambda x: x.text.strip(), sub_soup.find("p", class_="topic-body__content-text"))))
        location = get_location_from_text(title)
        cataclysmic_type = "Пожар"  # Пока заглушка TODO нужно реализовать нейросетку которая будет определять тип катаклизма

        if location is not None:
            incident = {"title": title, 'description': description, 'location': location,
                        'cataclysmic_type': cataclysmic_type, 'src': articles_hrefs[x]}

            incidents.append(incident)

    return incidents

# def pars():
#     website_url = requests.get('https://ria.ru/incidents/').text
#     soup = BeautifulSoup(website_url, "html.parser")
#
#     titles = soup.findAll('a', {'class': 'list-item__title'}, href=True)
#     articlesHrefs = list(map(lambda x: x['href'], titles))
#     incidents = []
#
#     for x in range(len(articlesHrefs)):
#         print(str(x + 1) + "/20")
#
#         sub_website_url = requests.get(articlesHrefs[x]).text
#         sub_soup = BeautifulSoup(sub_website_url, "html.parser")
#         title = sub_soup.find("div", class_="article__header").select('.article__title')[0].text
#         description = "".join(
#             list(map(lambda x: x.text, sub_soup.find("div", class_="article__body").select('.article__text'))))
#         location = get_location_from_text(title)  # Пока заглушка TODO нужно реализовать забор координат с геосервиса
#         cataclysmic_type = "Пожар"  # Пока заглушка TODO нужно реализовать нейросетку которая будет определять тип катаклизма
#
#         incident = {"title": title, 'description': description, 'location': location,
#                     'cataclysmic_type': cataclysmic_type, 'src': articlesHrefs[x]}
#
#         incidents.append(incident)
#
#     return incidents

# парсилка
class MymapAPIView(APIView):
    def get(self, request):

        Incident.objects.all().delete()

        incidents = []

        # content = pars()

        incidents.extend(get_incidents_from_rio_news())
        incidents.extend(get_incidents_from_kommersant())
        incidents.extend(get_incidents_from_kp())
        incidents.extend(get_incidents_from_lenta())

        serializer = IncidentSerializer(data=incidents, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors)


class MainAPIView(APIView):
    def get(self, request):
        incidents = Incident.objects.all()
        serializer = IncidentSerializer(incidents, many=True)

        return Response(serializer.data)

