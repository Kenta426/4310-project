# -*- coding: utf-8 -*-
import scrapy
from posters.items import MovieRankByPopularity


class MovieRank(scrapy.Spider):
    name = "movie-rank"
    urls = []
    for i in range(10):
        year = 1997 + i
        urls.append('https://letterboxd.com/films/popular/year/' + str(year) + '/size/large/')
    start_urls = urls

    def parse(self, response):
		# access to the data base
        database_url = response.css('#films-browser-list-container').xpath('@data-url')
        home = 'https://letterboxd.com'
        yield scrapy.Request(home + str(database_url.extract_first()), self.parse_movie_rank)

    def parse_movie_rank(self, response):
        home = 'https://letterboxd.com'
        movie_url = response.css('ul .listitem .react-component')\
        .xpath('@data-target-link').extract()

        next_url = home + str(response.css('.paginate-next')\
        .xpath('@href').extract_first())

        page = int(response.css('.paginate-next').xpath('@href')\
        .extract_first().split('/page/')[1].split('/')[0])

        movie_list = response.css('.poster-list .react-component')\
        .xpath('@data-film-id').extract()

        for i, movie in enumerate(movie_list):
            rank = 18*(page-2) + i + 1
            yield MovieRankByPopularity(
                data_id = movie,
                rank = rank)

        if page < 17:
            yield scrapy.Request(next_url, self.parse)
