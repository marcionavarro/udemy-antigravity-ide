/**
 * FinançasPro - Controle Financeiro Mensal
 * Tectreinamentos Informática LTDA
 * Desenvolvido com Antigravity
 */

(function () {
  'use strict';

  // Chaves de armazenamento LocalStorage
  const STORAGE_KEY_MONTHS = 'financaspro_months_data';
  const STORAGE_KEY_CATEGORIES = 'financaspro_custom_categories';
  const STORAGE_KEY_CURRENT_MONTH_ID = 'financaspro_current_month_id';
  const STORAGE_KEY_USER_NAME = 'financaspro_user_name';

  // Categorias padrão solicitadas pelo usuário
  const DEFAULT_CATEGORIES = [
    { id: 'cat_casa', name: 'Casa', icon: '🏠', isDefault: true },
    { id: 'cat_cartao', name: 'Cartão', icon: '💳', isDefault: true },
    { id: 'cat_compras', name: 'Compras', icon: '🛍️', isDefault: true },
    { id: 'cat_celular', name: 'Celular', icon: '📱', isDefault: true },
    { id: 'cat_seguros', name: 'Seguros', icon: '🛡️', isDefault: true },
    { id: 'cat_agua', name: 'Água', icon: '💧', isDefault: true },
    { id: 'cat_luz', name: 'Luz', icon: '⚡', isDefault: true }
  ];

  // Estado da aplicação
  let masterCategories = [];
  let monthsData = [];
  let currentMonthId = null;
  let userName = 'Seu Nome';

  // Instâncias dos Gráficos Chart.js
  let chartIncomeExpense = null;
  let chartCategoryDistribution = null;
  let chartMonthlyHistory = null;

  // Registrar Plugin DataLabels se estiver disponível
  if (typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
  }

  /* ==========================================================================
     INICIALIZAÇÃO & PERSISTÊNCIA
     ========================================================================== */

  function initApp() {
    loadUserName();
    loadCategories();
    loadMonthsData();
    setupEventListeners();
    setupTabs();
    setupMobileAntiShiftFix();
    renderApp();
  }

  // Carrega e salva nome do usuário
  function loadUserName() {
    const savedName = localStorage.getItem(STORAGE_KEY_USER_NAME);
    if (savedName && savedName.trim() !== '') {
      userName = savedName.trim();
    } else {
      userName = 'Seu Nome';
    }
    updateUserNameDisplay();
  }

  function saveUserName(name) {
    userName = name && name.trim() !== '' ? name.trim() : 'Seu Nome';
    localStorage.setItem(STORAGE_KEY_USER_NAME, userName);
    updateUserNameDisplay();
  }

  function updateUserNameDisplay() {
    const label = document.getElementById('userNameLabel');
    if (label) label.textContent = userName;
  }

  // Carrega lista mestre de categorias
  function loadCategories() {
    const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (saved) {
      try {
        masterCategories = JSON.parse(saved);
      } catch (e) {
        masterCategories = [...DEFAULT_CATEGORIES];
      }
    } else {
      masterCategories = [...DEFAULT_CATEGORIES];
      saveCategories();
    }
  }

  function saveCategories() {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(masterCategories));
  }

  // Carrega dados dos meses
  function loadMonthsData() {
    const saved = localStorage.getItem(STORAGE_KEY_MONTHS);
    if (saved) {
      try {
        monthsData = JSON.parse(saved);
      } catch (e) {
        monthsData = [];
      }
    }

    // Se estiver vazio, cria dados iniciais com Janeiro e Março (como sugerido pelo usuário)
    if (!monthsData || monthsData.length === 0) {
      const initialMonth = createMonthObject('Janeiro', 4500.00, {
        'cat_casa': 1200.00,
        'cat_cartao': 850.00,
        'cat_compras': 600.00,
        'cat_celular': 89.90,
        'cat_seguros': 140.00,
        'cat_agua': 75.50,
        'cat_luz': 165.20
      });

      const secondMonth = createMonthObject('Março', 4500.00, {
        'cat_casa': 1200.00,
        'cat_cartao': 620.00,
        'cat_compras': 450.00,
        'cat_celular': 89.90,
        'cat_seguros': 140.00,
        'cat_agua': 68.00,
        'cat_luz': 142.30
      });

      monthsData = [initialMonth, secondMonth];
      saveMonthsData();
    }

    // Determina o mês selecionado
    const savedCurrentId = localStorage.getItem(STORAGE_KEY_CURRENT_MONTH_ID);
    if (savedCurrentId && monthsData.some(m => m.id === savedCurrentId)) {
      currentMonthId = savedCurrentId;
    } else {
      currentMonthId = monthsData[0].id;
      localStorage.setItem(STORAGE_KEY_CURRENT_MONTH_ID, currentMonthId);
    }
  }

  function saveMonthsData() {
    localStorage.setItem(STORAGE_KEY_MONTHS, JSON.stringify(monthsData));
  }

  function createMonthObject(name, salary = 0, initialExpenses = {}) {
    const id = 'month_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const expenses = {};

    masterCategories.forEach(cat => {
      expenses[cat.id] = initialExpenses[cat.id] !== undefined ? initialExpenses[cat.id] : 0;
    });

    return {
      id: id,
      name: name.trim(),
      salary: Number(salary) || 0,
      expenses: expenses,
      createdAt: new Date().toISOString()
    };
  }

  function getCurrentMonth() {
    return monthsData.find(m => m.id === currentMonthId) || monthsData[0];
  }

  /* ==========================================================================
     UTILITÁRIOS DE FORMATAÇÃO E MOEDA
     ========================================================================== */

  function formatBRL(value) {
    const val = Number(value) || 0;
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  }

  function formatNumberString(value) {
    const val = Number(value) || 0;
    return val.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function parseBRLString(str) {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    const cleanStr = str.toString().replace(/\D/g, '');
    if (!cleanStr) return 0;
    return parseFloat(cleanStr) / 100;
  }

  function maskCurrencyInput(inputElement, onValueChange) {
    inputElement.addEventListener('input', function () {
      let digits = this.value.replace(/\D/g, '');
      if (digits === '') {
        this.value = '';
        if (onValueChange) onValueChange(0);
        return;
      }
      const num = parseFloat(digits) / 100;
      this.value = num.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      if (onValueChange) onValueChange(num);
    });
  }

  /* ==========================================================================
     CORREÇÃO RIGOROSA MOBILE ANTI-DESLOCAMENTO (ANDROID & IOS)
     ========================================================================== */

  function setupMobileAntiShiftFix() {
    // Quando qualquer input perde o foco no mobile, reposiciona a tela em X=0
    document.addEventListener('focusout', function (e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) {
        window.scrollTo({ left: 0, top: window.scrollY });
        if (document.documentElement.scrollLeft > 0) document.documentElement.scrollLeft = 0;
        if (document.body.scrollLeft > 0) document.body.scrollLeft = 0;
      }
    });

    // Previne rolagem horizontal provocada pelo teclado virtual ao focar
    document.addEventListener('focusin', function (e) {
      if (e.target && e.target.tagName === 'INPUT') {
        setTimeout(() => {
          if (window.scrollX > 0) {
            window.scrollTo({ left: 0, top: window.scrollY });
          }
        }, 100);
      }
    });
  }

  /* ==========================================================================
     RENDERIZAÇÃO PRINCIPAL
     ========================================================================== */

  function renderApp() {
    ensureAllMonthsHaveAllCategories();
    renderMonthPills();
    renderAnnualSummary();
    renderKPIs();
    renderSalaryInput();
    renderExpenseRows();
    updateCharts();
  }

  function ensureAllMonthsHaveAllCategories() {
    monthsData.forEach(month => {
      if (!month.expenses) month.expenses = {};
      masterCategories.forEach(cat => {
        if (month.expenses[cat.id] === undefined) {
          month.expenses[cat.id] = 0;
        }
      });
    });
  }

  // Pílulas de seleção de mês
  function renderMonthPills() {
    const container = document.getElementById('monthPillsContainer');
    container.innerHTML = '';

    monthsData.forEach(m => {
      const pill = document.createElement('button');
      pill.className = `month-pill ${m.id === currentMonthId ? 'active' : ''}`;
      pill.innerHTML = `<span>${escapeHTML(m.name)}</span>`;
      pill.addEventListener('click', () => {
        currentMonthId = m.id;
        localStorage.setItem(STORAGE_KEY_CURRENT_MONTH_ID, currentMonthId);
        renderApp();
      });
      container.appendChild(pill);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'btn-add-month-pill';
    addBtn.innerHTML = `<span>+ Mês</span>`;
    addBtn.addEventListener('click', openNewMonthModal);
    container.appendChild(addBtn);

    const curr = getCurrentMonth();
    const monthDisplay = document.getElementById('currentMonthNameDisplay');
    if (monthDisplay && curr) monthDisplay.textContent = curr.name;

    const chartMonthLabel = document.getElementById('chartMonthLabel');
    if (chartMonthLabel && curr) chartMonthLabel.textContent = curr.name;
  }

  // ==========================================================================
  // RENDER: ACUMULADO DO ANO
  // ==========================================================================
  function renderAnnualSummary() {
    let totalAnnualIncome = 0;
    let totalAnnualExpense = 0;

    monthsData.forEach(m => {
      totalAnnualIncome += (Number(m.salary) || 0);
      if (m.expenses) {
        Object.values(m.expenses).forEach(v => totalAnnualExpense += (Number(v) || 0));
      }
    });

    const totalAnnualBalance = totalAnnualIncome - totalAnnualExpense;
    const monthsCount = monthsData.length;

    document.getElementById('annualMonthsCount').textContent = `${monthsCount} ${monthsCount === 1 ? 'mês registrado' : 'meses registrados'}`;
    document.getElementById('annualTotalIncome').textContent = formatBRL(totalAnnualIncome);
    document.getElementById('annualTotalExpense').textContent = formatBRL(totalAnnualExpense);

    const balanceEl = document.getElementById('annualTotalBalance');
    balanceEl.textContent = formatBRL(totalAnnualBalance);
    balanceEl.className = `metric-val ${totalAnnualBalance >= 0 ? 'text-green' : 'text-orange'}`;

    // Percentuais e Barra de Progresso
    const spentPercent = totalAnnualIncome > 0 ? Math.min(100, Math.round((totalAnnualExpense / totalAnnualIncome) * 100)) : 0;
    const savingsPercent = totalAnnualIncome > 0 ? Math.max(0, Math.round((totalAnnualBalance / totalAnnualIncome) * 100)) : 0;

    const expenseLabel = document.getElementById('annualExpensePercentLabel');
    if (expenseLabel) expenseLabel.textContent = `Comprometimento da Renda: ${spentPercent}%`;

    const savingsLabel = document.getElementById('annualSavingsRateLabel');
    if (savingsLabel) savingsLabel.textContent = `Taxa de Economia: ${savingsPercent}%`;

    const barFill = document.getElementById('annualProgressBarFill');
    if (barFill) barFill.style.width = `${spentPercent}%`;
  }

  // KPIs de Topo: Mês Selecionado
  function renderKPIs() {
    const curr = getCurrentMonth();
    if (!curr) return;

    const salary = Number(curr.salary) || 0;
    let totalExpense = 0;

    Object.values(curr.expenses).forEach(val => {
      totalExpense += (Number(val) || 0);
    });

    const balance = salary - totalExpense;
    const spentPercent = salary > 0 ? Math.round((totalExpense / salary) * 100) : 0;

    document.getElementById('kpiIncome').textContent = formatBRL(salary);
    document.getElementById('kpiExpense').textContent = formatBRL(totalExpense);
    document.getElementById('kpiBalance').textContent = formatBRL(balance);

    const badge = document.getElementById('kpiPercentBadge');
    badge.textContent = `${spentPercent}% da renda`;

    const balanceCard = document.getElementById('balanceCard');
    balanceCard.classList.remove('positive', 'negative');
    badge.classList.remove('badge-green', 'badge-red');

    if (balance >= 0) {
      balanceCard.classList.add('positive');
      badge.classList.add('badge-green');
    } else {
      balanceCard.classList.add('negative');
      badge.classList.add('badge-red');
    }
  }

  function renderSalaryInput() {
    const curr = getCurrentMonth();
    const input = document.getElementById('monthlySalaryInput');
    if (!input || !curr) return;

    input.value = curr.salary > 0 ? formatNumberString(curr.salary) : '';
  }

  function renderExpenseRows() {
    const curr = getCurrentMonth();
    const list = document.getElementById('expenseItemsList');
    list.innerHTML = '';

    if (!curr) return;

    masterCategories.forEach(cat => {
      const val = curr.expenses[cat.id] || 0;

      const row = document.createElement('div');
      row.className = `expense-row ${!cat.isDefault ? 'custom-category-row' : ''}`;

      row.innerHTML = `
        <div class="expense-left">
          <div class="expense-icon-badge">${cat.icon || '📄'}</div>
          <div class="expense-name-wrap">
            <span class="expense-name">${escapeHTML(cat.name)}</span>
            <span class="expense-tag">${cat.isDefault ? 'Conta Padrão' : 'Personalizada (Fixa)'}</span>
          </div>
        </div>
        <div class="expense-right">
          <input 
            type="text" 
            inputmode="decimal" 
            class="input-money-item" 
            placeholder="0,00" 
            value="${val > 0 ? formatNumberString(val) : ''}"
            data-cat-id="${cat.id}"
          />
          ${!cat.isDefault ? `
            <button class="btn-remove-item" title="Remover esta categoria do sistema" data-remove-cat="${cat.id}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          ` : ''}
        </div>
      `;

      list.appendChild(row);

      const moneyInput = row.querySelector('.input-money-item');
      maskCurrencyInput(moneyInput, (numVal) => {
        curr.expenses[cat.id] = numVal;
        saveMonthsData();
        renderKPIs();
        renderAnnualSummary();
        updateCharts();
      });

      const removeBtn = row.querySelector('[data-remove-cat]');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          confirmRemoveCategory(cat.id, cat.name);
        });
      }
    });
  }

  /* ==========================================================================
     GERENCIAMENTO DE CATEGORIAS
     ========================================================================== */

  function handleAddCategory(name, icon, initialValue) {
    if (!name || name.trim() === '') {
      showToast('Por favor, informe o nome da conta.');
      return;
    }

    const catId = 'cat_custom_' + Date.now();
    const newCategory = {
      id: catId,
      name: name.trim(),
      icon: icon || '📄',
      isDefault: false
    };

    masterCategories.push(newCategory);
    saveCategories();

    const curr = getCurrentMonth();
    if (curr) {
      curr.expenses[catId] = initialValue || 0;
    }

    monthsData.forEach(m => {
      if (m.id !== currentMonthId) {
        m.expenses[catId] = 0;
      }
    });
    saveMonthsData();

    closeModal('modalAddCategory');
    showToast(`Conta "${newCategory.name}" incluída como padrão!`);
    renderApp();
  }

  function confirmRemoveCategory(catId, catName) {
    if (confirm(`Deseja remover a conta "${catName}" de todos os meses atuais e futuros?`)) {
      masterCategories = masterCategories.filter(c => c.id !== catId);
      saveCategories();

      monthsData.forEach(m => {
        if (m.expenses && m.expenses[catId] !== undefined) {
          delete m.expenses[catId];
        }
      });
      saveMonthsData();

      showToast(`Conta "${catName}" removida.`);
      renderApp();
    }
  }

  /* ==========================================================================
     GERENCIAMENTO DE MESES
     ========================================================================== */

  function handleCreateMonth(name, salary) {
    if (!name || name.trim() === '') {
      showToast('Por favor, informe o nome do mês.');
      return;
    }

    const newMonth = createMonthObject(name, salary);
    monthsData.push(newMonth);
    saveMonthsData();

    currentMonthId = newMonth.id;
    localStorage.setItem(STORAGE_KEY_CURRENT_MONTH_ID, currentMonthId);

    closeModal('modalNewMonth');
    showToast(`Mês "${newMonth.name}" criado com sucesso!`);
    renderApp();
  }

  function handleDeleteCurrentMonth() {
    if (monthsData.length <= 1) {
      showToast('É necessário ter ao menos um mês cadastrado.');
      return;
    }

    const curr = getCurrentMonth();
    if (confirm(`Tem certeza que deseja excluir o mês "${curr.name}" e seus lançamentos?`)) {
      monthsData = monthsData.filter(m => m.id !== curr.id);
      currentMonthId = monthsData[0].id;
      localStorage.setItem(STORAGE_KEY_CURRENT_MONTH_ID, currentMonthId);
      saveMonthsData();
      showToast(`Mês "${curr.name}" excluído.`);
      renderApp();
    }
  }

  /* ==========================================================================
     GRÁFICOS & ANÁLISE INTERATIVA COM PERCENTUAIS NATIVOS
     ========================================================================== */

  function updateCharts() {
    renderCategoryDistributionChart();
    renderIncomeExpenseChart();
    renderMonthlyHistoryChart();
  }

  // Gráfico 1: Distribuição dos Gastos por Categoria (PIZZA COM PERCENTUAIS NATIVOS)
  function renderCategoryDistributionChart() {
    const ctx = document.getElementById('categoryDistributionChart');
    if (!ctx) return;

    const curr = getCurrentMonth();
    if (!curr) return;

    const labels = [];
    const data = [];
    const colors = [
      '#FF6B00', '#FF8533', '#FFA066', '#FFB885',
      '#F59E0B', '#10B981', '#06B6D4', '#6366F1',
      '#EC4899', '#8B5CF6', '#14B8A6', '#F43F5E'
    ];

    const ranking = [];

    masterCategories.forEach((cat, index) => {
      const val = Number(curr.expenses[cat.id]) || 0;
      if (val > 0) {
        labels.push(`${cat.icon || ''} ${cat.name}`);
        data.push(val);
        ranking.push({ name: cat.name, icon: cat.icon, val: val, color: colors[index % colors.length] });
      }
    });

    if (chartCategoryDistribution) {
      chartCategoryDistribution.destroy();
    }

    const isDataEmpty = data.length === 0;
    if (isDataEmpty) {
      labels.push('Sem gastos informados');
      data.push(1);
    }

    const totalSpent = isDataEmpty ? 1 : data.reduce((a, b) => a + b, 0);

    chartCategoryDistribution = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: isDataEmpty ? ['#242936'] : colors.slice(0, data.length),
          borderWidth: 2,
          borderColor: '#161921',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          // EXIBIÇÃO DE PERCENTUAIS NATIVOS SOBRE AS FATIAS DA PIZZA
          datalabels: {
            display: function (context) {
              if (isDataEmpty) return false;
              const val = context.dataset.data[context.dataIndex];
              const pct = (val / totalSpent) * 100;
              return pct >= 4; // Exibe se for 4% ou mais para legibilidade
            },
            formatter: function (value) {
              const pct = Math.round((value / totalSpent) * 100);
              return `${pct}%`;
            },
            color: '#FFFFFF',
            font: {
              family: 'Plus Jakarta Sans',
              weight: 'bold',
              size: 11
            },
            textShadowColor: 'rgba(0, 0, 0, 0.7)',
            textShadowBlur: 4
          },
          legend: {
            position: 'bottom',
            labels: {
              color: '#F3F4F6',
              font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
              boxWidth: 12,
              padding: 10,
              generateLabels: function (chart) {
                const chartData = chart.data;
                if (chartData.labels.length && chartData.datasets.length) {
                  return chartData.labels.map((label, i) => {
                    const val = chartData.datasets[0].data[i];
                    const pct = isDataEmpty ? '' : ` (${Math.round((val / totalSpent) * 100)}%)`;
                    return {
                      text: `${label}${pct}`,
                      fillStyle: chartData.datasets[0].backgroundColor[i],
                      hidden: isNaN(chartData.datasets[0].data[i]) || chart.getDatasetMeta(0).data[i]?.hidden,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                if (isDataEmpty) return ' Nenhum valor inserido';
                const val = context.raw;
                const pct = ((val / totalSpent) * 100).toFixed(1);
                return ` ${formatBRL(val)} (${pct}%)`;
              }
            }
          }
        },
        cutout: '62%'
      }
    });

    // Top Ranking de Categorias com Barra Proporcional
    const rankingContainer = document.getElementById('topCategoriesRanking');
    if (rankingContainer) {
      ranking.sort((a, b) => b.val - a.val);
      if (ranking.length === 0) {
        rankingContainer.innerHTML = '<p class="section-description" style="text-align:center;">Nenhuma despesa lançada neste mês.</p>';
      } else {
        let total = ranking.reduce((acc, curr) => acc + curr.val, 0);
        let itemsHtml = ranking.map(item => {
          const pct = Math.round((item.val / total) * 100);
          return `
            <div class="ranking-item">
              <div class="ranking-name">
                <span style="font-size:1.15rem;">${item.icon || '📄'}</span>
                <span>${escapeHTML(item.name)} <strong style="color:var(--orange-primary); font-size:0.75rem;">${pct}%</strong></span>
              </div>
              <span class="ranking-val">${formatBRL(item.val)}</span>
            </div>
          `;
        }).join('');
        rankingContainer.innerHTML = itemsHtml;
      }
    }
  }

  // Gráfico 2: Comparativo Renda vs Gastos do Mês
  function renderIncomeExpenseChart() {
    const ctx = document.getElementById('incomeExpenseChart');
    if (!ctx) return;

    const curr = getCurrentMonth();
    const salary = curr ? (Number(curr.salary) || 0) : 0;
    let totalExpense = 0;

    if (curr) {
      Object.values(curr.expenses).forEach(v => totalExpense += (Number(v) || 0));
    }

    const balance = salary - totalExpense;

    if (chartIncomeExpense) {
      chartIncomeExpense.destroy();
    }

    chartIncomeExpense = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Renda', 'Gastos', 'Saldo'],
        datasets: [{
          data: [salary, totalExpense, balance],
          backgroundColor: [
            '#10B981',
            '#FF6B00',
            balance >= 0 ? '#3B82F6' : '#EF4444'
          ],
          borderRadius: 8,
          borderWidth: 0,
          barPercentage: 0.55
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: { display: false },
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                return ` ${formatBRL(context.raw)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#9CA3AF', font: { family: 'Plus Jakarta Sans', weight: '600' } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: {
              color: '#6B7280',
              font: { family: 'Plus Jakarta Sans' },
              callback: function (value) {
                return 'R$ ' + value.toLocaleString('pt-BR');
              }
            }
          }
        }
      }
    });

    const insightsContainer = document.getElementById('chartInsights');
    if (insightsContainer) {
      let insightHtml = '';
      if (salary === 0 && totalExpense === 0) {
        insightHtml = `
          <div class="insight-card">
            <span class="insight-icon">💡</span>
            <div class="insight-text">Preencha seu <strong>salário</strong> e os <strong>gastos</strong> deste mês para gerar a análise comparativa.</div>
          </div>
        `;
      } else if (balance > 0) {
        const percentSaved = Math.round((balance / salary) * 100);
        insightHtml = `
          <div class="insight-card">
            <span class="insight-icon">🎯</span>
            <div class="insight-text">Excelente! Você economizou <strong>${formatBRL(balance)}</strong> neste mês (aproximadamente <strong>${percentSaved}%</strong> da sua renda).</div>
          </div>
        `;
      } else if (balance === 0 && salary > 0) {
        insightHtml = `
          <div class="insight-card">
            <span class="insight-icon">⚖️</span>
            <div class="insight-text">Seus gastos empataram exatamente com o seu salário.</div>
          </div>
        `;
      } else {
        insightHtml = `
          <div class="insight-card">
            <span class="insight-icon">⚠️</span>
            <div class="insight-text">Alerta: Você gastou <strong>${formatBRL(Math.abs(balance))}</strong> a mais do que recebeu.</div>
          </div>
        `;
      }
      insightsContainer.innerHTML = insightHtml;
    }
  }

  // Gráfico 3: Histórico Comparativo de Todos os Meses
  function renderMonthlyHistoryChart() {
    const ctx = document.getElementById('monthlyHistoryChart');
    if (!ctx) return;

    const labels = monthsData.map(m => m.name);
    const salaries = monthsData.map(m => Number(m.salary) || 0);
    const expenses = monthsData.map(m => {
      let sum = 0;
      Object.values(m.expenses).forEach(v => sum += (Number(v) || 0));
      return sum;
    });

    if (chartMonthlyHistory) {
      chartMonthlyHistory.destroy();
    }

    chartMonthlyHistory = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Salário (Renda)',
            data: salaries,
            backgroundColor: '#10B981',
            borderRadius: 6,
            barPercentage: 0.7
          },
          {
            label: 'Total Gastos',
            data: expenses,
            backgroundColor: '#FF6B00',
            borderRadius: 6,
            barPercentage: 0.7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: { display: false },
          legend: {
            position: 'top',
            labels: { color: '#F3F4F6', font: { family: 'Plus Jakarta Sans', weight: '600' } }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return ` ${context.dataset.label}: ${formatBRL(context.raw)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#9CA3AF', font: { family: 'Plus Jakarta Sans', weight: '600' } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: {
              color: '#6B7280',
              callback: function (val) {
                return 'R$ ' + val.toLocaleString('pt-BR');
              }
            }
          }
        }
      }
    });

    // Renderiza a Tabela de Histórico com linha de Total Acumulado
    const tableBody = document.getElementById('historyTableBody');
    const tableFoot = document.getElementById('historyTableFoot');

    if (tableBody) {
      tableBody.innerHTML = '';
      let sumSal = 0;
      let sumExp = 0;

      monthsData.forEach(m => {
        const sal = Number(m.salary) || 0;
        let exp = 0;
        Object.values(m.expenses).forEach(v => exp += (Number(v) || 0));
        const bal = sal - exp;
        const isPos = bal >= 0;

        sumSal += sal;
        sumExp += exp;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${escapeHTML(m.name)}</strong></td>
          <td>${formatBRL(sal)}</td>
          <td><span style="color:var(--orange-light); font-weight:700;">${formatBRL(exp)}</span></td>
          <td style="font-weight:800; color:${isPos ? 'var(--status-positive)' : 'var(--status-negative)'};">${formatBRL(bal)}</td>
          <td>
            <span class="table-badge-status ${isPos ? 'azul' : 'vermelho'}">
              ${isPos ? 'No Azul' : 'No Vermelho'}
            </span>
          </td>
        `;
        tableBody.appendChild(tr);
      });

      // Linha de Rodapé com Total Acumulado do Ano
      if (tableFoot) {
        const totalBal = sumSal - sumExp;
        const totalIsPos = totalBal >= 0;
        const balColor = totalIsPos ? 'var(--status-positive)' : 'var(--status-negative)';
        tableFoot.innerHTML = `
          <tr>
            <td><strong>TOTAL DO ANO</strong></td>
            <td><strong>${formatBRL(sumSal)}</strong></td>
            <td><strong style="color:var(--orange-light);">${formatBRL(sumExp)}</strong></td>
            <td style="color:${balColor}; font-weight:800;">${formatBRL(totalBal)}</td>
            <td>
              <span class="table-badge-status ${totalIsPos ? 'azul' : 'vermelho'}">
                ${totalIsPos ? 'Superávit Anual' : 'Déficit Anual'}
              </span>
            </td>
          </tr>
        `;
      }
    }
  }

  /* ==========================================================================
     NAVEGAÇÃO POR TABS
     ========================================================================== */

  function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetTabId = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
        });

        const activeContent = document.getElementById(targetTabId);
        if (activeContent) activeContent.classList.add('active');

        if (targetTabId === 'tab-graficos' || targetTabId === 'tab-historico') {
          setTimeout(() => {
            if (chartIncomeExpense) chartIncomeExpense.resize();
            if (chartCategoryDistribution) chartCategoryDistribution.resize();
            if (chartMonthlyHistory) chartMonthlyHistory.resize();
          }, 60);
        }
      });
    });
  }

  /* ==========================================================================
     EVENT LISTENERS & MODAIS
     ========================================================================== */

  function setupEventListeners() {
    // Input de Salário do mês atual
    const salaryInput = document.getElementById('monthlySalaryInput');
    maskCurrencyInput(salaryInput, (numVal) => {
      const curr = getCurrentMonth();
      if (curr) {
        curr.salary = numVal;
        saveMonthsData();
        renderKPIs();
        renderAnnualSummary();
        updateCharts();
      }
    });

    // Nome do Usuário
    document.getElementById('btnOpenEditName').addEventListener('click', () => {
      const modal = document.getElementById('modalEditName');
      const input = document.getElementById('userNameInput');
      input.value = userName === 'Seu Nome' ? '' : userName;
      modal.classList.add('active');
      setTimeout(() => input.focus(), 150);
    });

    document.getElementById('btnSaveUserName').addEventListener('click', () => {
      const input = document.getElementById('userNameInput');
      saveUserName(input.value);
      closeModal('modalEditName');
      showToast(`Olá, ${userName}!`);
    });

    // Toggle Detalhes do Acumulado Anual
    const toggleAnnualBtn = document.getElementById('btnToggleAnnualDetails');
    const collapsibleAnnual = document.getElementById('annualDetailsCollapsible');
    if (toggleAnnualBtn && collapsibleAnnual) {
      toggleAnnualBtn.addEventListener('click', () => {
        if (collapsibleAnnual.style.display === 'none') {
          collapsibleAnnual.style.display = 'block';
          toggleAnnualBtn.textContent = 'Ocultar Detalhes';
        } else {
          collapsibleAnnual.style.display = 'none';
          toggleAnnualBtn.textContent = 'Ver Detalhes';
        }
      });
    }

    // Botões de Novo Mês
    document.getElementById('btnNewMonth').addEventListener('click', openNewMonthModal);
    document.getElementById('btnDeleteCurrentMonth').addEventListener('click', handleDeleteCurrentMonth);

    // Botões de Adicionar Conta
    document.getElementById('btnOpenAddCategory').addEventListener('click', openAddCategoryModal);
    document.getElementById('btnOpenAddCategoryMobile').addEventListener('click', openAddCategoryModal);

    // Confirmar Novo Mês
    document.getElementById('btnConfirmAddMonth').addEventListener('click', () => {
      const nameInput = document.getElementById('newMonthNameInput');
      const salaryInput = document.getElementById('newMonthSalaryInput');
      const salaryNum = parseBRLString(salaryInput.value);
      handleCreateMonth(nameInput.value, salaryNum);
    });

    const modalSalaryInput = document.getElementById('newMonthSalaryInput');
    maskCurrencyInput(modalSalaryInput);

    // Confirmar Nova Conta
    document.getElementById('btnConfirmAddCategory').addEventListener('click', () => {
      const nameInput = document.getElementById('newCategoryNameInput');
      const selectedIconBtn = document.querySelector('.icon-opt.selected');
      const icon = selectedIconBtn ? selectedIconBtn.getAttribute('data-icon') : '📄';
      const initialValInput = document.getElementById('newCategoryInitialValInput');
      const valNum = parseBRLString(initialValInput.value);

      handleAddCategory(nameInput.value, icon, valNum);
    });

    const modalCategoryValInput = document.getElementById('newCategoryInitialValInput');
    maskCurrencyInput(modalCategoryValInput);

    // Seletor de Ícones no Modal
    document.querySelectorAll('.icon-opt').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.icon-opt').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
      });
    });

    // Fechar modais pelos botões [data-close-modal]
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', function () {
        const modalId = this.getAttribute('data-close-modal');
        closeModal(modalId);
      });
    });

    // Fechar modal clicando fora
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });

    // Backup: Exportar
    document.getElementById('btnExportData').addEventListener('click', exportBackupData);

    // Backup: Importar
    const fileInput = document.getElementById('importFileInput');
    document.getElementById('btnImportData').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleImportFile);

    // Resetar Dados
    document.getElementById('btnResetData').addEventListener('click', () => {
      if (confirm('Atenção: isso restaurará os dados padrões e apagará registros customizados. Continuar?')) {
        localStorage.removeItem(STORAGE_KEY_MONTHS);
        localStorage.removeItem(STORAGE_KEY_CATEGORIES);
        localStorage.removeItem(STORAGE_KEY_CURRENT_MONTH_ID);
        localStorage.removeItem(STORAGE_KEY_USER_NAME);
        initApp();
        showToast('Dados restaurados com sucesso.');
      }
    });
  }

  function openNewMonthModal() {
    const modal = document.getElementById('modalNewMonth');
    document.getElementById('newMonthNameInput').value = '';
    document.getElementById('newMonthSalaryInput').value = '';
    modal.classList.add('active');
    setTimeout(() => document.getElementById('newMonthNameInput').focus(), 150);
  }

  function openAddCategoryModal() {
    const modal = document.getElementById('modalAddCategory');
    document.getElementById('newCategoryNameInput').value = '';
    document.getElementById('newCategoryInitialValInput').value = '';
    modal.classList.add('active');
    setTimeout(() => document.getElementById('newCategoryNameInput').focus(), 150);
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  /* ==========================================================================
     BACKUP & EXPORT/IMPORT JSON
     ========================================================================== */

  function exportBackupData() {
    const payload = {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      userName: userName,
      masterCategories: masterCategories,
      monthsData: monthsData
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `financas_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Backup exportado com sucesso!');
  }

  function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.monthsData && parsed.masterCategories) {
          masterCategories = parsed.masterCategories;
          monthsData = parsed.monthsData;
          currentMonthId = monthsData[0]?.id || null;
          if (parsed.userName) {
            userName = parsed.userName;
            localStorage.setItem(STORAGE_KEY_USER_NAME, userName);
            updateUserNameDisplay();
          }

          saveCategories();
          saveMonthsData();
          localStorage.setItem(STORAGE_KEY_CURRENT_MONTH_ID, currentMonthId);

          renderApp();
          showToast('Backup importado com sucesso!');
        } else {
          showToast('Formato de arquivo inválido.');
        }
      } catch (err) {
        showToast('Erro ao ler arquivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  /* ==========================================================================
     TOAST DE NOTIFICAÇÃO
     ========================================================================== */

  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>⚡</span><span>${escapeHTML(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // Inicializa o App ao carregar o DOM
  document.addEventListener('DOMContentLoaded', initApp);

})();
