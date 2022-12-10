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


def get_location_from_text(text):
    result = addr_extractor.find(text)
    if result is not None:
        return str(result).split("value='")[1].split("'")[0]
    return None


morph_vocab = MorphVocab()
addr_extractor = AddrExtractor(morph_vocab)


def pars():
    website_url = requests.get('https://ria.ru/incidents/').text
    soup = BeautifulSoup(website_url, "html.parser")

    titles = soup.findAll('a', {'class': 'list-item__title'}, href=True)
    articlesHrefs = list(map(lambda x: x['href'], titles))
    incidents = []

    for x in range(len(articlesHrefs)):
        print(str(x + 1) + "/20")

        sub_website_url = requests.get(articlesHrefs[x]).text
        sub_soup = BeautifulSoup(sub_website_url, "html.parser")
        title = sub_soup.find("div", class_="article__header").select('.article__title')[0].text
        description = "".join(
            list(map(lambda x: x.text, sub_soup.find("div", class_="article__body").select('.article__text'))))
        location = get_location_from_text(title)  # Пока заглушка TODO нужно реализовать забор координат с геосервиса
        cataclysmic_type = "Пожар"  # Пока заглушка TODO нужно реализовать нейросетку которая будет определять тип катаклизма

        incident = {"title": title, 'description': description, 'location': location,
                    'cataclysmic_type': cataclysmic_type, 'src': articlesHrefs[x]}

        incidents.append(incident)

    return incidents


class MymapAPIView(APIView):
    def get(self, request):

        content = pars()

        serializer = IncidentSerializer(data=content, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors)

