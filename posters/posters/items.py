# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# http://doc.scrapy.org/en/latest/topics/items.html

import scrapy


class PostersItem(scrapy.Item):
    # define the fields for your item here like:
    # name = scrapy.Field()
    ''' Item for the movie posters '''
    data_id = scrapy.Field()
    title = scrapy.Field()
    watched = scrapy.Field()
    liked = scrapy.Field()
    file_urls = scrapy.Field()
    files = scrapy.Field()

class MovieData(scrapy.Item):
    # data about the movie itself
    data_id = scrapy.Field()
    title = scrapy.Field()
    year = scrapy.Field()
    genre = scrapy.Field()
    rating = scrapy.Field()
    # imdb_id = scrapy.Field()

class MovieCountry(scrapy.Item):
    # data about the movie itself
    data_id = scrapy.Field()
    country = scrapy.Field()
    director = scrapy.Field()
    # year = scrapy.Field()
    # genre = scrapy.Field()
    # imdb_id = scrapy.Field()

class MovieRankByPopularity(scrapy.Item):
    # data about the movie itself
    data_id = scrapy.Field()
    rank = scrapy.Field()
