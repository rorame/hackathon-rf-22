import requests as requests
from bs4 import BeautifulSoup

from natasha import (
    Segmenter,
    MorphVocab,
    AddrExtractor,
)


class Incident:
    def __init__(self, title, description, location, src, cataclysmic_type):
        self.title = title
        self.description = description
        self.location = location
        self.src = src
        self.cataclysmic_type = cataclysmic_type


def get_location_from_text(text):
    result = addr_extractor.find(text)
    if result is not None:
        return str(result).split("value='")[1].split("'")[0]
    return None


morph_vocab = MorphVocab()
addr_extractor = AddrExtractor(morph_vocab)

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

    incidents.append(Incident(title=title, description=description, location=location, src=articlesHrefs[x],
                              cataclysmic_type=cataclysmic_type))

print(incidents)

