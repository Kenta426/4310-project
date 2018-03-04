# -*- coding: utf-8 -*-
import scrapy
from posters.items import MovieData

class PosterSpider(scrapy.Spider):
    name = "movie-spider"
    urls = []

    for i in range(10):
        year = 1997 + i
        urls.append('https://letterboxd.com/films/popular/year/' + str(year) + '/size/large/')

    start_urls = urls

    def parse(self, response):
		# access to the data base
        database_url = response.css('#films-browser-list-container').xpath('@data-url')
        home = 'https://letterboxd.com'
        yield scrapy.Request(home + str(database_url.extract_first()), self.parse_movie_link)


    def parse_movie_link(self, response):
        home = 'https://letterboxd.com'
        movie_url = response.css('ul .listitem .react-component').xpath('@data-target-link').extract()
        for movie in movie_url:
            data_url = home + str(movie) + 'genres/'
            yield scrapy.Request(data_url, self.parse_movie_data)

        next_url = home + str(response.css('.paginate-next').xpath('@href').extract_first())
        page = int(response.css('.paginate-next').xpath('@href').extract_first().split('/page/')[1].split('/')[0])
        if page < 17:
            yield scrapy.Request(next_url, self.parse)

    def parse_movie_data(self, response):
        genre = response.xpath('//div [@class = "col-17"]')\
        .xpath('//div [@id = "tab-genres" ]')\
        .css('a::text').extract()
        if len(genre) == 0:
            genre = [unicode('None', 'unicode-escape')]

        data_id =  response.xpath('//div [@id = "film-page-wrapper"]')\
        .css('.poster-list')\
        .xpath('//div')\
        .xpath('@data-film-id').extract_first()
        if len(data_id) == 0:
            data_id = unicode('None', 'unicode-escape')

        title = response.xpath('//div [@class = "col-17"]').css('#featured-film-header').css('h1::text').extract_first()
        if len(title) == 0:
            title = unicode('None', 'unicode-escape')

        year = response.xpath('//div [@class = "col-17"]')\
        .css('#featured-film-header').css('p .number a::text').extract_first()
        if len(year) == 0:
            year = unicode('None', 'unicode-escape')

        imdb_id = response.xpath('//div [@class = "col-17"]').xpath('//p [@class = "text-link text-footer"]').xpath('//a [@data-track-action = "IMDb"]').xpath('@href').extract_first()
        if imdb_id is None:
            imdb_id = unicode('None', 'unicode-escape')
        else:
            imdb_id = imdb_id.split('title/')[1].split('/')[0]

        yield MovieData(
            title = title,
            data_id = data_id,
            year = year,
            genre = genre,
            imdb_id = imdb_id)
