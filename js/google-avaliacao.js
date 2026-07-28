(() => {
    'use strict';

    /*
     * Para mostrar a nota e a quantidade de avaliações em tempo real:
     * 1. Crie uma chave no Google Cloud.
     * 2. Ative Maps JavaScript API e Places API (New).
     * 3. Restrinja a chave aos domínios do site.
     * 4. Cole a chave entre as aspas abaixo.
     *
     * Sem a chave, o cartão continua funcionando como link direto
     * para a ficha atualizada do hotel no Google Maps.
     */
    const GOOGLE_MAPS_API_KEY = 'COLE_SUA_CHAVE_AQUI';

    const consultaHotel = 'Hotel Palace Huesca, Avenida Brasil 550, Presidente Prudente, SP';
    const linkGoogleFallback = 'https://www.google.com/maps/search/?api=1&query=Hotel%20Palace%20Huesca%2C%20Avenida%20Brasil%20550%2C%20Presidente%20Prudente%2C%20SP';

    const card = document.getElementById('google-avaliacao');
    const nota = document.getElementById('google-avaliacao-nota');
    const total = document.getElementById('google-avaliacao-total');

    if (!card || !nota || !total) {
        return;
    }

    const mostrarFallback = (mensagem = 'Clique para ver as avaliações atualizadas') => {
        card.classList.remove('carregando');
        card.classList.add('erro');
        card.href = linkGoogleFallback;
        nota.textContent = 'Ver nota atual';
        total.textContent = mensagem;
        card.setAttribute('aria-label', 'Ver a avaliação atual do Hotel Palace Huesca no Google Maps');
    };

    const chaveNaoConfigurada = !GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'COLE_SUA_CHAVE_AQUI';

    if (chaveNaoConfigurada) {
        mostrarFallback();
        return;
    }

    card.classList.add('carregando');
    nota.textContent = 'Carregando…';
    total.textContent = 'Consultando os dados atuais do Google';

    window.iniciarAvaliacaoGoogle = async () => {
        try {
            const { Place } = await google.maps.importLibrary('places');
            const { places } = await Place.searchByText({
                textQuery: consultaHotel,
                fields: ['displayName', 'formattedAddress', 'rating', 'userRatingCount', 'googleMapsURI'],
                language: 'pt-BR',
                region: 'BR',
                maxResultCount: 1
            });

            const hotel = places && places[0];

            if (!hotel || typeof hotel.rating !== 'number') {
                throw new Error('O Google não retornou uma avaliação para o hotel.');
            }

            const notaFormatada = hotel.rating.toLocaleString('pt-BR', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            });

            const quantidade = Number.isFinite(hotel.userRatingCount)
                ? hotel.userRatingCount.toLocaleString('pt-BR')
                : null;

            card.classList.remove('carregando', 'erro');
            card.href = hotel.googleMapsURI || linkGoogleFallback;
            nota.textContent = `${notaFormatada} de 5`;
            total.textContent = quantidade
                ? `${quantidade} avaliações · dados atuais do Google`
                : 'Dados atuais do Google';
            card.setAttribute(
                'aria-label',
                quantidade
                    ? `Hotel Palace Huesca: nota ${notaFormatada} de 5, com ${quantidade} avaliações no Google. Abrir avaliações.`
                    : `Hotel Palace Huesca: nota ${notaFormatada} de 5 no Google. Abrir avaliações.`
            );
        } catch (erro) {
            console.error('Não foi possível carregar a avaliação do Google:', erro);
            mostrarFallback('Não foi possível carregar a nota agora. Clique para abrir no Google.');
        }
    };

    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&loading=async&libraries=places&callback=iniciarAvaliacaoGoogle&v=weekly&language=pt-BR&region=BR`;
    script.onerror = () => mostrarFallback('Falha ao conectar ao Google. Clique para abrir as avaliações.');
    document.head.appendChild(script);
})();
