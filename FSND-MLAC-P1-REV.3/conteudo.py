# -*- coding: cp1252 -*-
# Informa��es de estilo e JS para p�gina.
# Observa��es:
# 1. Cabe�alho modificado em rela��o ao fornecido pelo fresh_tomatoes original
# 2. O bootstrap utilizado foi obtido em
# https://getbootstrap.com/docs/3.3/customize/
# 3. A vers�o 3.3 do bootstrap foi utilizada devido a
# incompatibilidades na vers�o 4.1
# 4. API obtida em (https://developers.google.com/fonts/docs/developer_api)
# possui uma forma din�nica, por meio de uma chave API pessoal
# 5. o Jquery foi mera op��o e ele pode ser substitu�do conforme a aplica��o:
# (https://en.wikipedia.org/wiki/Comparison_of_JavaScript_frameworks)

main_page_head = '''
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta charset="utf-8">
    <title>Filmes do Cabral</title>
    <!-- Bootstrap 3 -->
    <link rel="stylesheet" href="./config/css/bootstrap.min.css">
    <link rel="stylesheet" href="./config/css/bootstrap-theme.min.css">
    <link rel="stylesheet" href="./config/css/main.css">
    <link href="https://fonts.googleapis.com/css?family=Tangerine:bold,
    bolditalic|Inconsolata:italic|Droid+Sans" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-1.10.1.min.js"></script>
    <script src="./config/javascript/bootstrap.min.js"></script>
    <script src="./config/javascript/main.js"></script>
</head>
'''

# Conte�do da p�gina
# Observa��es:
# 1. Todas as tentativas de modificar o endere�o (https://lh5.ggpht.com/)
# geraram erro (este endere�o � origin�rio do fresh_tomatoes original).

main_page_content = '''
  <body>
    <!-- Trailer -->
    <div class="modal" id="trailer">
      <div class="modal-dialog">
        <div class="modal-content">
          <a href="#" class="hanging-close" data-dismiss="modal"
          aria-hidden="true">
            <img src="https://lh5.ggpht.com/
            v4-628SilF0HtHuHdu5EzxD7WRqOrrTIDi_MhEG6_qkNtUK5Wg7KPkofp_
            VJoF7RS2LhxwEFCO1ICHZlc-o_=s0#w=24&h=24"/>
          </a>
          <div class="scale-media" id="trailer-video-container">
          </div>
        </div>
      </div>
    </div>
    <!-- conteudo -->
    <div class="navbar navbar-fixed-top" role="navigation">
    <div class="container">
      <div class="navbar-header">
        <span class="navbar-brand">Filmes do Cabral</span>
      </div>
    </div>
    </div>
    <ul class="movies container list-inline">
      {movie_tiles}
    </ul>
  </body>
</html>
'''

# Entrada dos filmes e configura��o do modo interativo.
# Observa��es:
# 1. Esta modifica��o do fresh_tomatoes original, visa criar um fundo
# interativo.
# 2. Dimens�es seguem o tamanho da imagem, para haver a comuta��o com o fundo.

movie_tile_content = '''
<li>
    <div class="movie-tile animated text-center"
    >
        <div class="img-wrapper center-block">
            <img src="{poster_image_url}" width="300" height="180">
        </div>
        <div class="movie-data center-block animated fadeIn">
            <div>{storyline}</div>
            <button class="watch"
                    data-trailer-youtube-id="{trailer_youtube_id}"
                    data-toggle="modal" data-target="#trailer"
            >
            Trailer</button>
        </div>
        <h3>{movie_title}</h3>
    </div>
</li>
'''
