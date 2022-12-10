import requests as requests
from bs4 import BeautifulSoup
from natasha import (
    Segmenter,
    MorphVocab,
    AddrExtractor,
)

morph_vocab = MorphVocab()
addr_extractor = AddrExtractor(morph_vocab)


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


def get_incidents_from_rio_news():
    website_url = requests.get('https://ria.ru/incidents/').text
    soup = BeautifulSoup(website_url, "html.parser")

    titles = soup.findAll('a', {'class': 'list-item__title'}, href=True)
    articles_hrefs = list(map(lambda x: x['href'], titles))

    print()
    print("Get incidents from rio news:")
    for x in range(len(articles_hrefs)):
        print(str(x + 1) + "/" + str(len(articles_hrefs)))

        sub_website_url = requests.get(articles_hrefs[x]).text
        sub_soup = BeautifulSoup(sub_website_url, "html.parser")
        title = sub_soup.find("div", class_="article__header").select('.article__title')[0].text
        description = "".join(
            list(map(lambda x: x.text, sub_soup.find("div", class_="article__body").select('.article__text'))))
        location = get_location_from_text(title)  # Пока заглушка TODO нужно реализовать забор координат с геосервиса
        cataclysmic_type = "Пожар"  # Пока заглушка TODO нужно реализовать нейросетку которая будет определять тип катаклизма

        incidents.append(Incident(title=title, description=description, location=location, src=articles_hrefs[x],
                                  cataclysmic_type=cataclysmic_type))


def get_incidents_from_kommersant():
    website_url = requests.get('https://www.kommersant.ru/rubric/6?from=burger').text
    soup = BeautifulSoup(website_url, "html.parser")

    titles = soup.findAll('a', {'class': 'uho__link uho__link--overlay'}, href=True)
    articles_hrefs = list(map(lambda x: "https://www.kommersant.ru" + x['href'], titles))

    print()
    print("Get incidents from kommersant:")
    for x in range(len(articles_hrefs)):
        print(str(x + 1) + "/" + str(len(articles_hrefs)))

        sub_website_url = requests.get(articles_hrefs[x]).text
        sub_soup = BeautifulSoup(sub_website_url, "html.parser")
        title = sub_soup.find("h1", class_="doc_header__name js-search-mark").text.strip()
        description = "".join(
            list(map(lambda x: x.text.strip(), sub_soup.find("p", class_="doc__text"))))
        location = get_location_from_text(title)  # Пока заглушка TODO нужно реализовать забор координат с геосервиса
        cataclysmic_type = "Пожар"  # Пока заглушка TODO нужно реализовать нейросетку которая будет определять тип катаклизма

        incidents.append(Incident(title=title, description=description, location=location, src=articles_hrefs[x],
                                  cataclysmic_type=cataclysmic_type))


def get_incidents_from_kp():
    website_url = requests.get('https://www.kp.ru/incidents/').text
    soup = BeautifulSoup(website_url, "html.parser")

    titles = soup.findAll('a', {'class': 'sc-1tputnk-2'}, href=True)
    articles_hrefs = list(map(lambda x: "https://www.nsk.kp.ru" + x['href'], titles))

    print()
    print("Get incidents from KP:")
    for x in range(len(articles_hrefs)):
        print(str(x + 1) + "/" + str(len(articles_hrefs)))

        sub_website_url = requests.get(articles_hrefs[x]).text
        sub_soup = BeautifulSoup(sub_website_url, "html.parser")
        title = sub_soup.find("h1", class_="sc-j7em19-3").text.strip()
        description = "".join(
            list(map(lambda x: x.text.strip(), sub_soup.find("p", class_="sc-1wayp1z-16"))))
        location = get_location_from_text(title)  # Пока заглушка TODO нужно реализовать забор координат с геосервиса
        cataclysmic_type = "Пожар"  # Пока заглушка TODO нужно реализовать нейросетку которая будет определять тип катаклизма

        incidents.append(Incident(title=title, description=description, location=location, src=articles_hrefs[x],
                                  cataclysmic_type=cataclysmic_type))


def get_incidents_from_lenta():
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
        location = get_location_from_text(title)  # Пока заглушка TODO нужно реализовать забор координат с геосервиса
        cataclysmic_type = "Пожар"  # Пока заглушка TODO нужно реализовать нейросетку которая будет определять тип катаклизма

        incidents.append(Incident(title=title, description=description, location=location, src=articles_hrefs[x],
                                  cataclysmic_type=cataclysmic_type))


incidents = []

get_incidents_from_rio_news()
get_incidents_from_kommersant()
get_incidents_from_kp()
get_incidents_from_lenta()

