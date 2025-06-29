async function buscarClima() {
  const cidadeInput = document.getElementById('cidade-input');
  const resultadoDiv = document.getElementById('resultado');
  const cidade = cidadeInput.value.trim();

  if (!cidade) {
    resultadoDiv.innerHTML = '<p class="error">Por favor, insira uma cidade</p>';
    return;
  }

  try {
    resultadoDiv.innerHTML = `
      <div class="loading">
        <p>Buscando dados para ${cidade}...</p>
      </div>
    `;

    // ✅ Alterado: URL completa do backend na Render
    const resposta = await fetch(`https://tp2-pw-2.onrender.com/api/weather/city/${encodeURIComponent(cidade)}`, {
      credentials: 'include'
    });

    if (!resposta.ok) {
      const erro = await resposta.json();
      throw new Error(erro.error || 'Erro na requisição');
    }

    const dados = await resposta.json();

    // Construção do HTML com dados combinados
    let html = `
      <div class="weather-card">
        <h2>${dados.city}, ${dados.countryCode}</h2>
        <div class="weather-main">
          <img src="${dados.icon}" alt="${dados.conditions}">
          <div>
            <p class="temperature">${Math.round(dados.temperature)}°C</p>
            <p class="conditions">${dados.conditions}</p>
            <p>Humidade: ${dados.humidity}% | Vento: ${dados.wind} km/h</p>
          </div>
        </div>
    `;

    // Seção de dados do país (se disponível)
    if (dados.country) {
      html += `
        <div class="country-info">
          <h3>Informações do País</h3>
          <div class="country-content">
            <img src="${dados.country.flag}" alt="Bandeira" class="flag">
            <div>
              <p><strong>Capital:</strong> ${dados.country.capital}</p>
              <p><strong>População:</strong> ${dados.country.population}</p>
              <p><strong>Moeda:</strong> ${dados.country.currency}</p>
              ${dados.country.languages ? `<p><strong>Línguas:</strong> ${dados.country.languages}</p>` : ''}
            </div>
          </div>
        </div>
      `;
    }

    html += `</div>`; // Fecha weather-card
    resultadoDiv.innerHTML = html;

  } catch (erro) {
    console.error('Erro detalhado:', erro);

    let mensagem = erro.message;
    if (erro.message.includes('404')) mensagem = 'Cidade não encontrada';
    if (erro.message.includes('401')) {
      mensagem = 'Sessão expirada. Faça login novamente';
      setTimeout(() => window.location.href = 'login.html', 2000);
    }

    resultadoDiv.innerHTML = `
      <div class="error">
        <p>❌ ${mensagem}</p>
        <p>Tente cidades como "Lisboa", "Paris" ou "Tóquio"</p>
      </div>
    `;
  }
}

// Adiciona evento ao botão (se existir na página)
document.getElementById('buscar-btn')?.addEventListener('click', buscarClima);
