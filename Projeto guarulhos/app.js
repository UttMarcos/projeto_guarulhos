// Inicializando o mapa focado em Guarulhos
const map = L.map('map', {
    center: [-23.4628, -46.5333], // Coordenadas de Guarulhos
    zoom: 13,                    // Zoom inicial
    maxBounds: [
      [-23.525, -46.588],        // Coordenada sudoeste (inferior esquerda)
      [-23.393, -46.448]         // Coordenada nordeste (superior direita)
    ],
    maxBoundsViscosity: 1.0      // Previne que o usuário mova o mapa para fora dos limites definidos
  });
  
  // Adicionando tiles do mapa
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);
  
  // Vetor para armazenar problemas
  const problemas = [];
  
  // Ícones personalizados para cada tipo de problema
  const icones = {
    lixo: L.icon({ iconUrl: 'images/lixo.png', iconSize: [25, 25] }),
    iluminacao: L.icon({ iconUrl: 'images/lampada.png', iconSize: [25, 25] }),
    buraco: L.icon({ iconUrl: 'images/buraco.png', iconSize: [25, 25] }),
  };
  
  // Função para adicionar problema com geocodificação
  async function adicionarProblema() {
    const tipo = document.getElementById('tipo').value;
    const cep = document.getElementById('cep').value;
    const numero = document.getElementById('numero').value;
    const descricao = document.getElementById('descricao').value;
  
    if (!cep || !numero || !descricao) {
      alert("Por favor, preencha todos os campos!");
      return;
    }
  
    try {
      // Construindo o endereço com CEP e número
      const endereco = `${cep}, ${numero}, Guarulhos`;
  
      // Chamando API de Geocodificação para buscar coordenadas
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(endereco)}&format=json`);
      const data = await response.json();
  
      if (data.length === 0) {
        alert("Endereço não encontrado. Verifique o CEP ou o número e tente novamente.");
        return;
      }
  
      // Pegando a primeira coordenada retornada
      const { lat, lon } = data[0];
  
      // Adiciona marcador no mapa
      const marker = L.marker([lat, lon], { icon: icones[tipo], draggable: true }).addTo(map);
      marker.bindPopup(`<b>${tipo}</b><br>${descricao}`).openPopup();
  
      // Salva no array de problemas
      problemas.push({ tipo, descricao, endereco, lat, lon, marker });
      atualizarLista();
      salvarDados();
  
      // Faz zoom no local inserido e ajusta o foco
      map.setView([lat, lon], 17); // Centraliza no último problema inserido
    } catch (error) {
      alert("Ocorreu um erro ao buscar o endereço. Tente novamente.");
      console.error(error);
    }
  }
  
  // Atualizar lista de problemas no painel
  function atualizarLista() {
    const lista = document.getElementById('problemas');
    lista.innerHTML = '';
    problemas.forEach((p, index) => {
      const item = document.createElement('li');
      item.textContent = `${p.tipo}: ${p.descricao} (${p.endereco})`;
      lista.appendChild(item);
    });
  }
  
  // Salvar dados no LocalStorage
  function salvarDados() {
    const data = problemas.map(p => ({
      tipo: p.tipo,
      descricao: p.descricao,
      endereco: p.endereco,
      lat: p.lat,
      lon: p.lon,
    }));
    localStorage.setItem('problemas', JSON.stringify(data));
  }
  
  // Carregar dados do LocalStorage
  function carregarDados() {
    const data = JSON.parse(localStorage.getItem('problemas')) || [];
    data.forEach(p => {
      const marker = L.marker([p.lat, p.lon], { icon: icones[p.tipo], draggable: true }).addTo(map);
      marker.bindPopup(`<b>${p.tipo}</b><br>${p.descricao}`).openPopup();
      problemas.push({ ...p, marker });
    });
    atualizarLista();
  }
  
  // Carregar dados ao iniciar
  window.onload = carregarDados;
  
  