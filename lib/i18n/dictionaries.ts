export type Locale = "pt" | "es";

export type Dictionary = {
  appName: string;
  connecting: string;
  home: {
    createOffer: string;
    subscription: string;
    priceLogs: string;
    emptyTitle: string;
    emptyDescription: string;
    initialSubtitle: string;
    initialTitle: string;
    initialCta: string;
    initialSubscriptionCta: string;
    initialBullets: [string, string, string];
    columns: {
      enabled: string;
      name: string;
      display: string;
      period: string;
      status: string;
      products: string;
      actions: string;
    };
    displayTags: {
      banner: string;
      showcase: string;
      pdp: string;
    };
    status: Record<string, string>;
    deleteConfirm: string;
    deleted: string;
    saved: string;
    error: string;
    confirmCancel: string;
    confirmContinue: string;
    deleteConfirmTitle: string;
    deleteConfirmBody: string;
    deleteConfirmBodyPrices: string;
    toggleEnableTitle: string;
    toggleEnableBody: string;
    toggleEnableBodyPrices: string;
    toggleDisableTitle: string;
    toggleDisableBody: string;
    toggleDisableBodyPrices: string;
    pricesSyncWarning: string;
    filters: {
      title: string;
      enabled: string;
      enabledAll: string;
      enabledActive: string;
      enabledInactive: string;
      name: string;
      namePlaceholder: string;
      date: string;
      dateHelp: string;
      status: string;
      statusAll: string;
      sortBy: string;
      sortStatus: string;
      sortEnabled: string;
      sortStartsAt: string;
      clear: string;
      apply: string;
      empty: string;
      results: string;
      openFilters: string;
      chipEnabled: string;
      chipDate: string;
      chipStatus: string;
      chipSort: string;
      prevPage: string;
      nextPage: string;
      pageOf: string;
    };
  };
  form: {
    createTitle: string;
    editTitle: string;
    editSubtitle: string;
    referenceName: string;
    referenceHelp: string;
    startsAt: string;
    endsAt: string;
    periodScheduleHelp: string;
    autoApplyPrices: string;
    autoApplyAlertTitle: string;
    autoApplyAlertBody: string;
    selectionType: string;
    selectionManual: string;
    selectionCategory: string;
    selectProducts: string;
    selectCategories: string;
    productsSelected: string;
    categoriesSelected: string;
    filterAllCategories: string;
    selectAllFromCategory: string;
    selectAllFromCategoryNamed: string;
    productsSection: string;
    configurePrices: string;
    configurePricesTitle: string;
    configurePricesHelp: string;
    configurePricesApply: string;
    resetOriginalPrices: string;
    skuCount: string;
    priceFrom: string;
    priceTo: string;
    noDiscountConfirmTitle: string;
    noDiscountConfirmBody: string;
    noDiscountConfirmContinue: string;
    applyNowConfirmTitle: string;
    applyNowConfirmBody: string;
    applyNowConfirmContinue: string;
    pricesAppliedToast: string;
    pricesApplyErrorToast: string;
    priceTable: string;
    fillMode: string;
    fillPercent: string;
    fillFixed: string;
    fillManual: string;
    fillValue: string;
    applyFill: string;
    colProduct: string;
    colVariant: string;
    colOriginal: string;
    colOffer: string;
    showcase: string;
    showcaseSection: string;
    showcaseHelp: string;
    showcaseSlot: string;
    dedicatedPage: string;
    dedicatedPageSection: string;
    dedicatedPageHelp: string;
    contentSection: string;
    contentSectionHelp: string;
    contentTabShowcase: string;
    contentTabPage: string;
    sectionActive: string;
    sectionInactive: string;
    showcaseAlertTitle: string;
    pageAlertTitle: string;
    showcaseInactiveHelp: string;
    pageInactiveHelp: string;
    copyFromPage: string;
    copyFromShowcase: string;
    copySectionDataDone: string;
    sectionTitle: string;
    sectionTitlePlaceholder: string;
    sectionSubtitle: string;
    sectionSubtitlePlaceholder: string;
    sectionTextTop: string;
    sectionTextTopPlaceholder: string;
    sectionTextBottom: string;
    sectionTextBottomPlaceholder: string;
    sectionBannerTop: string;
    sectionBannerBottom: string;
    sectionLayout: string;
    sectionLayoutGrid: string;
    sectionLayoutCarousel: string;
    sectionItemsPerRow: string;
    sectionItemsPerRowHelp: string;
    banner: string;
    bannerSection: string;
    bannerHelp: string;
    bannerCardTitle: string;
    bannerInactiveHelp: string;
    bannerType: string;
    bannerImage: string;
    bannerBar: string;
    bannerSlot: string;
    bannerTitle: string;
    bannerLink: string;
    bannerModelPick: string;
    bannerModelSolid: string;
    bannerModelSolidDesc: string;
    bannerModelStrip: string;
    bannerModelStripDesc: string;
    bannerModelSoft: string;
    bannerModelSoftDesc: string;
    bannerModelUrgent: string;
    bannerModelUrgentDesc: string;
    bannerText1: string;
    bannerText2: string;
    bannerText1Placeholder: string;
    bannerText2Placeholder: string;
    bannerShowButton: string;
    bannerButtonText: string;
    bannerButtonTextPlaceholder: string;
    bannerButtonUrl: string;
    bannerButtonUrlPlaceholder: string;
    bannerButtonPosition: string;
    bannerButtonPosition_before: string;
    bannerButtonPosition_after: string;
    bannerButtonPosition_full: string;
    bannerContainer: string;
    bannerTextAlign: string;
    bannerTextAlign_left: string;
    bannerTextAlign_center: string;
    bannerTextAlign_right: string;
    bannerSpacingTop: string;
    bannerSpacingBottom: string;
    bannerSpacing_0: string;
    bannerSpacing_1: string;
    bannerSpacing_2: string;
    bannerSpacing_3: string;
    bannerSpacing_4: string;
    bannerSpacing_5: string;
    bannerAnimation: string;
    bannerAnimation_none: string;
    bannerAnimation_pulse: string;
    bannerAnimation_shine: string;
    bannerAnimation_slide: string;
    uploadImage: string;
    countdownSection: string;
    countdownHelp: string;
    countdownItems: string;
    countdownPdp: string;
    countdownItemsCardTitle: string;
    countdownPdpCardTitle: string;
    countdownItemsInactiveHelp: string;
    countdownPdpInactiveHelp: string;
    countdownShowDays: string;
    countdownShowDaysHelp: string;
    countdownFormatHours: string;
    countdownFormatHoursDesc: string;
    countdownFormatDays: string;
    countdownFormatDaysDesc: string;
    countdownUnitDay: string;
    countdownUnitHour: string;
    countdownUnitMin: string;
    countdownUnitSec: string;
    countdownItemsSlot: string;
    countdownPdpSlot: string;
    countdownPreviewItems: string;
    countdownPreviewPdp: string;
    countdownText1: string;
    countdownText2: string;
    countdownTextTitle: string;
    countdownTextHelp: string;
    countdownText1Placeholder: string;
    countdownText2Placeholder: string;
    countdownModelPick: string;
    countdownModelItemsBadge: string;
    countdownModelItemsBadgeDesc: string;
    countdownModelItemsBar: string;
    countdownModelItemsBarDesc: string;
    countdownModelItemsFlash: string;
    countdownModelItemsFlashDesc: string;
    countdownModelItemsInline: string;
    countdownModelItemsInlineDesc: string;
    countdownModelItemsHero: string;
    countdownModelItemsHeroDesc: string;
    countdownModelPdpUrgency: string;
    countdownModelPdpUrgencyDesc: string;
    countdownModelPdpInline: string;
    countdownModelPdpInlineDesc: string;
    countdownModelPdpProgress: string;
    countdownModelPdpProgressDesc: string;
    countdownModelPdpFloating: string;
    countdownModelPdpFloatingDesc: string;
    countdownModelPdpBanner: string;
    countdownModelPdpBannerDesc: string;
    theme: string;
    themeHelp: string;
    themePrimary: string;
    themeSecondary: string;
    themeBackground: string;
    themeText: string;
    themeAccent: string;
    themeButton: string;
    themeButtonText: string;
    themeCountdownBg: string;
    themeCountdownText: string;
    themeRadius: string;
    enableOnSave: string;
    cancel: string;
    back: string;
    save: string;
    requiredFields: string;
    nameRequired: string;
    itemsRequired: string;
    datesInvalid: string;
    searchProducts: string;
    selectPageTitle: string;
    searchPages: string;
    createNewPage: string;
    pagesEmpty: string;
    pageSelected: string;
    selectPage: string;
    generalSection: string;
    displaySection: string;
    periodSection: string;
    selectCategoriesTitle: string;
    searchCategories: string;
    categoriesEmpty: string;
    preview: string;
    previewHelp: string;
    previewUntitled: string;
    previewBanner: string;
    previewShowcase: string;
    previewPdp: string;
    previewEndsIn: string;
    previewNoProducts: string;
    previewSampleProduct: string;
    previewCountdownOff: string;
  };
  slots: Record<string, string>;
  subscription: {
    title: string;
    faq: string;
    current: string;
    active: string;
    inactive: string;
    trial: string;
    suspended: string;
    startDate: string;
    nextPayment: string;
    cancel: string;
    history: string;
    choosePlan: string;
    currentPlan: string;
    customTitle: string;
    customDescription: string;
    features: {
      animated: string;
      unlimited: string;
      iconAndText: string;
      email: string;
      whatsapp: string;
    };
    trialCardTitle: string;
    trialCardPrice: string;
    trialCardDescription: string;
    proCardDescription: string;
    proPriceHint: string;
    managedByNuvemshop: string;
    blockedTitle: string;
    blockedDescription: string;
    goToSubscription: string;
    trialActiveDescription: string;
  };
  priceLogs: {
    title: string;
    subtitle: string;
    back: string;
    empty: string;
    emptyTitle: string;
    emptyText: string;
    emptyFilteredTitle: string;
    emptyFilteredText: string;
    emptyClearFilters: string;
    emptyBackOffers: string;
    searchPlaceholder: string;
    openFilters: string;
    filtersTitle: string;
    applyFilters: string;
    clearFilters: string;
    results: string;
    filterAction: string;
    filterSuccess: string;
    filterDate: string;
    dateAll: string;
    dateLast7: string;
    dateLast15: string;
    dateLast30: string;
    dateCustom: string;
    dateFrom: string;
    dateTo: string;
    dateCustomHelp: string;
    chipDate: string;
    chipAction: string;
    chipResult: string;
    all: string;
    success: string;
    failed: string;
    actionApply: string;
    actionRestore: string;
    actionActivate: string;
    actionDeactivate: string;
    colWhen: string;
    colOffer: string;
    colAction: string;
    colResult: string;
    colMessage: string;
    colPricesApplied: string;
    retryRestore: string;
    retryOk: string;
    retryFail: string;
    yes: string;
    no: string;
    msgApplied: string;
    msgReapplied: string;
    msgRestored: string;
    msgSkippedNotApplied: string;
    msgSkippedNoItems: string;
    msgStatusChange: string;
    viewDetails: string;
    detailTitle: string;
    detailClose: string;
    detailProducts: string;
    detailVariants: string;
    detailAttempts: string;
    detailMaxAttempts: string;
    detailHighestAttempt: string;
    detailAttemptRow: string;
    detailNoAttempts: string;
    detailErrors: string;
    detailNoErrors: string;
    detailMeta: string;
    detailEndpoint: string;
    detailForce: string;
    detailSource: string;
    detailBug: string;
    detailRaw: string;
  };
  products: {
    title: string;
    apply: string;
    loading: string;
    empty: string;
  };
};

const pt: Dictionary = {
  appName: "Ofertas Programadas Pro",
  connecting: "Conectando...",
  home: {
    createOffer: "+ Novo grupo de ofertas",
    subscription: "Assinatura",
    priceLogs: "Logs de preços",
    emptyTitle: "Nenhuma oferta ainda",
    emptyDescription:
      "Crie seu primeiro grupo de ofertas com preços, datas e vitrine.",
    initialSubtitle: "OFERTAS PRO",
    initialTitle: "Gerencie campanhas promocionais com precisão",
    initialCta: "Criar grupo de ofertas",
    initialSubscriptionCta: "ASSINATURA",
    initialBullets: [
      "Defina preços por variação com % , desconto fixo ou manual",
      "Ative e desative automaticamente por data com cron",
      "Exiba vitrine, banner com cronômetro e página dedicada",
    ],
    columns: {
      enabled: "Ativo",
      name: "Nome",
      display: "Exibição",
      period: "Período",
      status: "Status",
      products: "Produtos",
      actions: "Ação",
    },
    displayTags: {
      banner: "BANNER",
      showcase: "VITRINE",
      pdp: "PDP",
    },
    status: {
      draft: "Rascunho",
      scheduled: "Agendada",
      active: "Ativa",
      ended: "Encerrada",
      disabled: "Desativada",
    },
    deleteConfirm: "Tem certeza que deseja excluir este grupo de ofertas?",
    deleted: "Oferta excluída com sucesso.",
    saved: "Oferta salva com sucesso.",
    error: "Ocorreu um erro. Tente novamente.",
    confirmCancel: "Cancelar",
    confirmContinue: "Confirmar",
    deleteConfirmTitle: "Excluir grupo de ofertas?",
    deleteConfirmBody:
      "Essa ação remove o grupo permanentemente. Os produtos deixam de fazer parte desta campanha.",
    deleteConfirmBodyPrices:
      "Os preços promocionais aplicados na loja serão restaurados aos valores originais antes da exclusão.",
    toggleEnableTitle: "Ativar grupo de ofertas?",
    toggleEnableBody:
      "O grupo voltará a aparecer na loja conforme o período e as opções de exibição configuradas.",
    toggleEnableBodyPrices:
      "Se a oferta estiver no período ativo e o desconto automático estiver ligado, os preços promocionais serão aplicados nos produtos agora.",
    toggleDisableTitle: "Desativar grupo de ofertas?",
    toggleDisableBody:
      "O grupo deixará de aparecer na loja (banner, vitrine e PDP) enquanto estiver desativado.",
    toggleDisableBodyPrices:
      "Os preços promocionais aplicados serão restaurados aos valores originais nos produtos da loja.",
    pricesSyncWarning:
      "Isso percorre os produtos do grupo e reajusta os preços na Nuvemshop quando necessário.",
    filters: {
      title: "Filtrar e ordenar",
      enabled: "Ativo / Inativo",
      enabledAll: "Todos",
      enabledActive: "Ativo",
      enabledInactive: "Inativo",
      name: "Nome",
      namePlaceholder: "Buscar",
      date: "Data",
      dateHelp: "Mostra ofertas cujo período inclui esta data",
      status: "Status",
      statusAll: "Todos",
      sortBy: "Ordenar por",
      sortStatus: "Status",
      sortEnabled: "Ativo / Inativo",
      sortStartsAt: "Data de início",
      clear: "Limpar filtros",
      apply: "Aplicar filtros",
      empty: "Nenhum grupo encontrado com estes filtros.",
      results: "{count} grupos",
      openFilters: "Filtros",
      chipEnabled: "Ativo: {value}",
      chipDate: "Data: {value}",
      chipStatus: "Status: {value}",
      chipSort: "Ordenar: {value}",
      prevPage: "Anterior",
      nextPage: "Próxima",
      pageOf: "Página {page} de {totalPages}",
    },
  },
  form: {
    createTitle: "Criar grupo de ofertas",
    editTitle: "Editar grupo de ofertas",
    editSubtitle: "Configure produtos, preços, datas e exibição na vitrine",
    referenceName: "Nome do grupo",
    referenceHelp: "Apenas para controle interno — não aparece na loja.",
    startsAt: "Data de início",
    endsAt: "Data de término",
    periodScheduleHelp:
      "A oferta é iniciada e pausada automaticamente conforme as datas configuradas.",
    autoApplyPrices: "Aplicar descontos automaticamente nos preços da loja",
    autoApplyAlertTitle: "Como funciona a aplicação automática",
    autoApplyAlertBody:
      "Com esta opção marcada, no início da oferta atualizamos via API os preços De e Por dos produtos com os valores da tabela. Ao terminar o período, restauramos os preços anteriores. Se deixar desmarcado, os preços da loja não são alterados — controlamos só a parte visual (vitrines, banners e cronômetros).",
    selectionType: "Seleção de produtos",
    selectionManual: "Produtos individuais",
    selectionCategory: "Por categoria",
    selectProducts: "Selecionar produtos",
    selectCategories: "Selecionar categorias",
    productsSelected: "{count} produtos selecionados",
    categoriesSelected: "{count} categorias selecionadas",
    filterAllCategories: "Todas as categorias",
    selectAllFromCategory: "Selecionar todos da categoria",
    selectAllFromCategoryNamed: "Selecionar todos de “{name}”",
    productsSection: "Produtos da Oferta",
    configurePrices: "Configurar preços",
    configurePricesTitle: "Configurar preços da oferta",
    configurePricesHelp:
      "Por padrão os preços de oferta começam iguais aos originais. Escolha um preenchimento e clique em aplicar, ou edite manualmente cada SKU.",
    configurePricesApply: "Aplicar modificações",
    resetOriginalPrices: "Usar preços originais",
    skuCount: "{count} SKUs",
    priceFrom: "De",
    priceTo: "Por",
    noDiscountConfirmTitle: "Salvar sem alterar os preços?",
    noDiscountConfirmBody:
      "A aplicação automática de descontos está ativa, mas nenhum preço da tabela foi alterado. Deseja continuar mesmo assim? Na loja, os valores De e Por permanecerão iguais aos atuais.",
    noDiscountConfirmContinue: "Salvar mesmo assim",
    applyNowConfirmTitle: "Atualizar preços agora?",
    applyNowConfirmBody:
      "Este grupo está ativo e dentro do prazo, com aplicação automática ligada. Ao confirmar, os preços promocionais dos produtos serão atualizados imediatamente na loja.",
    applyNowConfirmContinue: "Confirmar e atualizar",
    pricesAppliedToast: "Oferta salva e preços atualizados na loja.",
    pricesApplyErrorToast:
      "Oferta salva, mas houve erro ao atualizar alguns preços. Tente novamente ou aguarde o sincronismo automático.",
    priceTable: "Tabela de preços promocionais",
    fillMode: "Preenchimento padrão",
    fillPercent: "Desconto %",
    fillFixed: "Desconto fixo",
    fillManual: "Manual",
    fillValue: "Valor",
    applyFill: "Aplicar na tabela",
    colProduct: "Produto",
    colVariant: "Variação",
    colOriginal: "Preço original",
    colOffer: "Preço oferta",
    showcase: "Exibir vitrine da oferta",
    showcaseSection: "Vitrine",
    showcaseHelp:
      "A vitrine aparece em um local da loja (home ou seções) e mostra os produtos desta oferta com título, textos, banners e layout (grade ou carrossel). Ative para configurar o conteúdo e onde ela será exibida.",
    showcaseSlot: "Local da vitrine na loja",
    dedicatedPage: "Exibir página extra",
    dedicatedPageSection: "Página dedicada",
    dedicatedPageHelp:
      "A página extra publica o conteúdo da oferta em uma página da loja (URL própria), com título, textos, banners e a listagem dos produtos. Ative para escolher a página e montar o conteúdo.",
    contentSection: "Vitrine e página da oferta",
    contentSectionHelp:
      "Use as abas para configurar a vitrine na loja e/ou a página extra. Ative cada opção no alerta para liberar o formulário.",
    contentTabShowcase: "Vitrine de oferta",
    contentTabPage: "Página extra",
    sectionActive: "Ativo",
    sectionInactive: "Inativo",
    showcaseAlertTitle: "Como funciona a vitrine de oferta",
    pageAlertTitle: "Como funciona a página extra",
    showcaseInactiveHelp:
      "Ative para exibir a vitrine da oferta na loja e configurar o conteúdo.",
    pageInactiveHelp:
      "Ative para publicar o conteúdo da oferta em uma página extra da loja.",
    copyFromPage: "Colocar dados da página extra",
    copyFromShowcase: "Colocar dados da vitrine",
    copySectionDataDone: "Dados copiados com sucesso.",
    sectionTitle: "Título",
    sectionTitlePlaceholder: "Ex.: Oferta relâmpago",
    sectionSubtitle: "Subtítulo",
    sectionSubtitlePlaceholder: "Ex.: Só até domingo",
    sectionTextTop: "Texto de cima",
    sectionTextTopPlaceholder: "Texto acima dos produtos",
    sectionTextBottom: "Texto de baixo",
    sectionTextBottomPlaceholder: "Texto abaixo dos produtos",
    sectionBannerTop: "Banner do topo",
    sectionBannerBottom: "Banner de baixo",
    sectionLayout: "Layout dos produtos",
    sectionLayoutGrid: "Grade",
    sectionLayoutCarousel: "Carrossel",
    sectionItemsPerRow: "Itens por linha",
    sectionItemsPerRowHelp:
      "Na grade, define as colunas. No carrossel, define a largura aproximada de cada card.",
    banner: "Ativar banner da oferta",
    bannerSection: "Banner",
    bannerHelp:
      "Mostra uma barra com cronômetro em um local da loja durante o período da oferta. Escolha o modelo e os textos inicial e final.",
    bannerCardTitle: "Exibição do banner",
    bannerInactiveHelp:
      "Ative para mostrar a barra com cronômetro na loja e configurar local, modelo e textos.",
    bannerType: "Tipo de banner",
    bannerImage: "Imagem",
    bannerBar: "Barra com cronômetro",
    bannerSlot: "Local do banner na loja",
    bannerTitle: "Título do banner",
    bannerLink: "Link do banner",
    bannerModelPick: "Modelo do banner",
    bannerModelSolid: "Barra destacada",
    bannerModelSolidDesc: "Fundo na cor principal com chip do tempo.",
    bannerModelStrip: "Faixa contínua",
    bannerModelStripDesc: "Faixa escura centralizada com textos e timer.",
    bannerModelSoft: "Suave",
    bannerModelSoftDesc: "Fundo claro com textos e timer na cor da oferta.",
    bannerModelUrgent: "Urgente",
    bannerModelUrgentDesc: "Faixa intensa com timer em destaque.",
    bannerText1: "Texto inicial",
    bannerText2: "Texto final",
    bannerText1Placeholder: "Ex.: Oferta por tempo limitado",
    bannerText2Placeholder: "Ex.: Aproveite agora",
    bannerShowButton: "Ativar link / botão no banner",
    bannerButtonText: "Texto do botão",
    bannerButtonTextPlaceholder: "Ex.: Ver ofertas",
    bannerButtonUrl: "Link",
    bannerButtonUrlPlaceholder: "https://... ou /caminho",
    bannerButtonPosition: "Posição do botão",
    bannerButtonPosition_before: "Antes do conteúdo",
    bannerButtonPosition_after: "Depois do conteúdo",
    bannerButtonPosition_full: "Banner inteiro (só link)",
    bannerContainer: "Limitar a largura da página",
    bannerTextAlign: "Alinhamento do conteúdo",
    bannerTextAlign_left: "Esquerda",
    bannerTextAlign_center: "Centro",
    bannerTextAlign_right: "Direita",
    bannerSpacingTop: "Espaçamento superior",
    bannerSpacingBottom: "Espaçamento inferior",
    bannerSpacing_0: "Sem espaçamento",
    bannerSpacing_1: "5 px",
    bannerSpacing_2: "10 px",
    bannerSpacing_3: "15 px",
    bannerSpacing_4: "20 px",
    bannerSpacing_5: "25 px",
    bannerAnimation: "Animação",
    bannerAnimation_none: "Nenhuma",
    bannerAnimation_pulse: "Pulso",
    bannerAnimation_shine: "Brilho",
    bannerAnimation_slide: "Deslize",
    uploadImage: "Enviar imagem",
    countdownSection: "Cronômetros",
    countdownHelp:
      "Exibe a contagem regressiva até o fim da oferta nos locais escolhidos da vitrine e da página do produto. Ao ativar, escolha o modelo, o slot e veja a prévia.",
    countdownItems: "Nos itens da vitrine",
    countdownPdp: "Na página do produto",
    countdownItemsCardTitle: "Exibição nas vitrines",
    countdownPdpCardTitle: "Exibição na página do produto",
    countdownItemsInactiveHelp:
      "Ative para mostrar o cronômetro nos cards da vitrine e configurar local, modelo e prévia.",
    countdownPdpInactiveHelp:
      "Ative para mostrar o cronômetro na página do produto e configurar local, modelo e prévia.",
    countdownShowDays: "Mostrar dias no cronômetro",
    countdownShowDaysHelp: "Escolha como o tempo restante aparece no cronômetro.",
    countdownFormatHours: "Só horas",
    countdownFormatHoursDesc: "Ex.: 53:42:18 (horas totais)",
    countdownFormatDays: "Com dias",
    countdownFormatDaysDesc: "Ex.: 2d 05:42:18",
    countdownUnitDay: "Dia",
    countdownUnitHour: "Hora",
    countdownUnitMin: "Min",
    countdownUnitSec: "Seg",
    countdownItemsSlot: "Local na vitrine",
    countdownPdpSlot: "Local na página do produto",
    countdownPreviewItems: "Prévia",
    countdownPreviewPdp: "Prévia",
    countdownText1: "Texto 1",
    countdownText2: "Texto 2",
    countdownTextTitle: "Textos dos modelos",
    countdownTextHelp:
      "Textos usados nos modelos (ex.: “A oferta expira em”, “Oferta de tempo limitado” / “Aproveite agora”). Se vazio, usamos o padrão do modelo.",
    countdownText1Placeholder: "Ex.: A oferta expira em",
    countdownText2Placeholder: "Ex.: Aproveite agora",
    countdownModelPick: "Escolha o modelo do cronômetro",
    countdownModelItemsBadge: "Badge de canto",
    countdownModelItemsBadgeDesc: "Pill com timer sobre o card",
    countdownModelItemsBar: "Barra compacta",
    countdownModelItemsBarDesc: "Barra de progresso sob o preço",
    countdownModelItemsFlash: "Flash sale",
    countdownModelItemsFlashDesc: "Pill de alta urgência",
    countdownModelItemsInline: "Inline minimalista",
    countdownModelItemsInlineDesc: "Blocos HH:MM:SS",
    countdownModelItemsHero: "Hero timer",
    countdownModelItemsHeroDesc: "Timer grande com dias/horas",
    countdownModelPdpUrgency: "Caixa de urgência",
    countdownModelPdpUrgencyDesc: "Bloco destacado com HH:MM:SS",
    countdownModelPdpInline: "Inline sutil",
    countdownModelPdpInlineDesc: "Ao lado do preço",
    countdownModelPdpProgress: "Progresso",
    countdownModelPdpProgressDesc: "Barra + tempo restante",
    countdownModelPdpFloating: "Badge flutuante",
    countdownModelPdpFloatingDesc: "Selo compacto de expiração",
    countdownModelPdpBanner: "Faixa minimalista",
    countdownModelPdpBannerDesc: "Banner fino com timer",
    theme: "Cores & Estilo",
    themeHelp:
      "Defina as cores e o estilo visual usados nos componentes da oferta (vitrine, banner e cronômetros).",
    themePrimary: "Cor primária",
    themeSecondary: "Cor secundária",
    themeBackground: "Fundo",
    themeText: "Texto",
    themeAccent: "Destaque",
    themeButton: "Botão",
    themeButtonText: "Texto do botão",
    themeCountdownBg: "Fundo do cronômetro",
    themeCountdownText: "Texto do cronômetro",
    themeRadius: "Border radius",
    enableOnSave: "Ativo",
    cancel: "Cancelar",
    back: "Voltar",
    save: "Salvar",
    requiredFields: "Preencha os campos obrigatórios para salvar.",
    nameRequired: "Informe o nome do grupo.",
    itemsRequired: "Adicione ao menos um item na tabela de preços.",
    datesInvalid: "A data de término deve ser posterior à de início.",
    searchProducts: "Buscar por nome ou SKU...",
    selectPageTitle: "Selecionar página extra",
    searchPages: "Buscar página...",
    createNewPage: "Criar nova página",
    pagesEmpty: "Nenhuma página encontrada.",
    pageSelected: "Página selecionada: {name}",
    selectPage: "Selecionar página",
    generalSection: "Grupo",
    displaySection: "Exibições & Modelos",
    periodSection: "Período da oferta",
    selectCategoriesTitle: "Selecionar categorias",
    searchCategories: "Buscar categoria...",
    categoriesEmpty: "Nenhuma categoria encontrada.",
    preview: "Pré-visualização",
    previewHelp:
      "Simulação aproximada do banner, vitrine e cronômetro na loja.",
    previewUntitled: "Nome da oferta",
    previewBanner: "Banner",
    previewShowcase: "Vitrine",
    previewPdp: "Página do produto",
    previewEndsIn: "Termina em",
    previewNoProducts: "Selecione produtos para ver a vitrine.",
    previewSampleProduct: "Produto de exemplo",
    previewCountdownOff: "Cronômetro desativado neste local.",
  },
  slots: {
    before_main_content: "Antes do conteúdo principal",
    after_header: "Após o header",
    before_footer: "Antes do rodapé",
    before_section_products_sale: "Antes da seção de promoções (home)",
    after_section_products_sale: "Após a seção de promoções (home)",
    before_section_products_new: "Antes da seção de novidades (home)",
    after_section_products_new: "Após a seção de novidades (home)",
    before_section_products_featured: "Antes da seção em destaque (home)",
    after_section_products_featured: "Após a seção em destaque (home)",
    product_grid_item_image_top_left: "Canto superior esquerdo da imagem",
    product_grid_item_image_top_right: "Canto superior direito da imagem",
    product_grid_item_image_bottom_left: "Canto inferior esquerdo da imagem",
    product_grid_item_image_bottom_right: "Canto inferior direito da imagem",
    before_product_grid_item_name: "Antes do nome do produto",
    after_product_grid_item_name: "Após o nome do produto",
    before_product_grid_item_price: "Antes do preço",
    after_product_grid_item_price: "Após o preço",
    product_detail_image_top_left: "Canto superior esquerdo da foto",
    product_detail_image_top_right: "Canto superior direito da foto",
    product_detail_image_bottom_left: "Canto inferior esquerdo da foto",
    product_detail_image_bottom_right: "Canto inferior direito da foto",
    before_product_detail_name: "Antes do nome",
    after_product_detail_name: "Após o nome",
    before_product_detail_price: "Antes do preço",
    after_product_detail_price: "Após o preço",
    before_product_detail_payment_options: "Antes das formas de pagamento",
    after_product_detail_payment_options: "Após as formas de pagamento",
    before_product_detail_add_to_cart: "Antes do botão comprar",
    after_product_detail_add_to_cart: "Após o botão comprar",
  },
  subscription: {
    title: "Planos e assinaturas",
    faq: "Perguntas frequentes",
    current: "Assinatura atual",
    active: "Ativa",
    inactive: "Inativa",
    trial: "Teste grátis",
    suspended: "Suspensa",
    startDate: "Início",
    nextPayment: "Próximo pagamento",
    cancel: "Encerrar assinatura",
    history: "Histórico de assinaturas",
    choosePlan: "Quero este plano",
    currentPlan: "Plano atual",
    customTitle: "Personalizado",
    customDescription:
      "Precisa de mais? Fale conosco para uma solução sob medida.",
    features: {
      animated: "Campanhas com cronômetro",
      unlimited: "Grupos de ofertas ilimitados",
      iconAndText: "Vitrine, banners e página dedicada",
      email: "Suporte por e-mail",
      whatsapp: "Suporte por WhatsApp",
    },
    trialCardTitle: "Teste grátis",
    trialCardPrice: "Gerenciado pela Nuvemshop",
    trialCardDescription:
      "O período de testes é definido automaticamente na instalação do app.",
    proCardDescription:
      "Para lojas que querem rodar campanhas promocionais com automação.",
    proPriceHint: "Valor na fatura da Nuvemshop",
    managedByNuvemshop:
      "Assinatura e período de testes são controlados automaticamente pela Nuvemshop na instalação do app.",
    blockedTitle: "Assinatura necessária",
    blockedDescription:
      "Não há assinatura ativa para esta loja. A cobrança e o acesso são gerenciados pela Nuvemshop.",
    goToSubscription: "Ver planos",
    trialActiveDescription:
      "Você está no período de testes. A data da primeira cobrança aparece em “Próximo pagamento”.",
  },
  priceLogs: {
    title: "Logs de sincronização de preços",
    subtitle:
      "Histórico de aplicação e restauração de preços promocionais na Nuvemshop.",
    back: "Voltar",
    empty: "Nenhum log encontrado com estes filtros.",
    emptyTitle: "Nenhum log de preços ainda",
    emptyText:
      "Quando uma campanha aplicar ou restaurar preços na Nuvemshop, o histórico aparece aqui.",
    emptyFilteredTitle: "Nenhum log encontrado",
    emptyFilteredText:
      "Não há registros com os filtros ou a busca atuais. Ajuste os critérios ou limpe os filtros.",
    emptyClearFilters: "Limpar filtros",
    emptyBackOffers: "Voltar para ofertas",
    searchPlaceholder: "Buscar por nome da campanha",
    openFilters: "Filtros",
    filtersTitle: "Filtrar logs",
    applyFilters: "Aplicar filtros",
    clearFilters: "Limpar filtros",
    results: "{count} registros",
    filterAction: "Ação",
    filterSuccess: "Resultado",
    filterDate: "Período",
    dateAll: "Todo o período",
    dateLast7: "Últimos 7 dias",
    dateLast15: "Últimos 15 dias",
    dateLast30: "Últimos 30 dias",
    dateCustom: "Data inicial / final",
    dateFrom: "Data inicial",
    dateTo: "Data final",
    dateCustomHelp: "Mostra logs criados entre as datas selecionadas.",
    chipDate: "Período: {value}",
    chipAction: "Ação: {value}",
    chipResult: "Resultado: {value}",
    all: "Todos",
    success: "Sucesso",
    failed: "Falhou",
    actionApply: "Aplicar preços",
    actionRestore: "Restaurar preços",
    actionActivate: "Ativar oferta",
    actionDeactivate: "Desativar oferta",
    colWhen: "Quando",
    colOffer: "Campanha",
    colAction: "Ação",
    colResult: "Resultado",
    colMessage: "Detalhe",
    colPricesApplied: "Preços na loja",
    retryRestore: "Tentar restaurar",
    retryOk: "Restore reenviado com sucesso.",
    retryFail: "Falha ao restaurar. Veja o novo log.",
    yes: "Sim",
    no: "Não",
    msgApplied: "Preços aplicados",
    msgReapplied: "Preços reaplicados",
    msgRestored: "Preços restaurados",
    msgSkippedNotApplied: "Ignorado: preços não estavam aplicados",
    msgSkippedNoItems: "Ignorado: campanha sem produtos",
    msgStatusChange: "{from} → {to}",
    viewDetails: "Detalhes",
    detailTitle: "Detalhe do log",
    detailClose: "Fechar",
    detailProducts: "Produtos",
    detailVariants: "Variações",
    detailAttempts: "Tentativas na API",
    detailMaxAttempts: "Máximo por produto",
    detailHighestAttempt: "Maior tentativa usada",
    detailAttemptRow: "Produto {productId}: {count} tentativa(s)",
    detailNoAttempts: "Nenhuma tentativa registrada neste log.",
    detailErrors: "Erros",
    detailNoErrors: "Nenhum erro retornado.",
    detailMeta: "Metadados",
    detailEndpoint: "Endpoint",
    detailForce: "Forçado",
    detailSource: "Origem",
    detailBug: "Erro inesperado",
    detailRaw: "JSON completo",
  },
  products: {
    title: "Selecionar produtos",
    apply: "Aplicar seleção",
    loading: "Carregando...",
    empty: "Nenhum resultado encontrado.",
  },
};

const es: Dictionary = {
  ...pt,
  appName: "Ofertas Programadas Pro",
  connecting: "Conectando...",
  home: {
    ...pt.home,
    createOffer: "+ Nuevo grupo de ofertas",
    subscription: "Suscripción",
    priceLogs: "Logs de precios",
    emptyTitle: "Aún no hay ofertas",
    emptyDescription:
      "Creá tu primer grupo de ofertas con precios, fechas y vitrina.",
    initialSubtitle: "OFERTAS PRO",
    initialTitle: "Gestioná campañas promocionales con precisión",
    initialCta: "Crear grupo de ofertas",
    initialSubscriptionCta: "SUSCRIPCIÓN",
    initialBullets: [
      "Definí precios por variación con %, descuento fijo o manual",
      "Activá y desactivá automáticamente por fecha con cron",
      "Mostrá vitrina, banner con temporizador y página dedicada",
    ],
    columns: {
      enabled: "Activo",
      name: "Nombre",
      display: "Exhibición",
      period: "Período",
      status: "Estado",
      products: "Productos",
      actions: "Acción",
    },
    displayTags: {
      banner: "BANNER",
      showcase: "VITRINA",
      pdp: "PDP",
    },
    status: {
      draft: "Borrador",
      scheduled: "Programada",
      active: "Activa",
      ended: "Finalizada",
      disabled: "Desactivada",
    },
    deleteConfirm: "¿Seguro que deseas eliminar este grupo de ofertas?",
    deleted: "Oferta eliminada con éxito.",
    saved: "Oferta guardada con éxito.",
    error: "Ocurrió un error. Intenta nuevamente.",
    confirmCancel: "Cancelar",
    confirmContinue: "Confirmar",
    deleteConfirmTitle: "¿Eliminar grupo de ofertas?",
    deleteConfirmBody:
      "Esta acción elimina el grupo de forma permanente. Los productos dejan de formar parte de esta campaña.",
    deleteConfirmBodyPrices:
      "Los precios promocionales aplicados en la tienda se restaurarán a los valores originales antes de eliminar.",
    toggleEnableTitle: "¿Activar grupo de ofertas?",
    toggleEnableBody:
      "El grupo volverá a mostrarse en la tienda según el período y las opciones de exhibición configuradas.",
    toggleEnableBodyPrices:
      "Si la oferta está en el período activo y el descuento automático está activado, los precios promocionales se aplicarán en los productos ahora.",
    toggleDisableTitle: "¿Desactivar grupo de ofertas?",
    toggleDisableBody:
      "El grupo dejará de mostrarse en la tienda (banner, vitrina y PDP) mientras esté desactivado.",
    toggleDisableBodyPrices:
      "Los precios promocionales aplicados se restaurarán a los valores originales en los productos de la tienda.",
    pricesSyncWarning:
      "Esto recorre los productos del grupo y reajusta los precios en Nuvemshop cuando sea necesario.",
    filters: {
      title: "Filtrar y ordenar",
      enabled: "Activo / Inactivo",
      enabledAll: "Todos",
      enabledActive: "Activo",
      enabledInactive: "Inactivo",
      name: "Nombre",
      namePlaceholder: "Buscar",
      date: "Fecha",
      dateHelp: "Muestra ofertas cuyo período incluye esta fecha",
      status: "Estado",
      statusAll: "Todos",
      sortBy: "Ordenar por",
      sortStatus: "Estado",
      sortEnabled: "Activo / Inactivo",
      sortStartsAt: "Fecha de inicio",
      clear: "Limpiar filtros",
      apply: "Aplicar filtros",
      empty: "Ningún grupo encontrado con estos filtros.",
      results: "{count} grupos",
      openFilters: "Filtros",
      chipEnabled: "Activo: {value}",
      chipDate: "Fecha: {value}",
      chipStatus: "Estado: {value}",
      chipSort: "Ordenar: {value}",
      prevPage: "Anterior",
      nextPage: "Siguiente",
      pageOf: "Página {page} de {totalPages}",
    },
  },
  form: {
    ...pt.form,
    createTitle: "Crear grupo de ofertas",
    editTitle: "Editar grupo de ofertas",
    editSubtitle: "Configurá productos, precios, fechas y exhibición",
    referenceName: "Nombre del grupo",
    referenceHelp: "Solo para control interno — no aparece en la tienda.",
    startsAt: "Fecha de inicio",
    endsAt: "Fecha de fin",
    periodScheduleHelp:
      "La oferta se inicia y se pausa automáticamente según las fechas configuradas.",
    autoApplyPrices: "Aplicar descuentos automáticamente en los precios de la tienda",
    autoApplyAlertTitle: "Cómo funciona la aplicación automática",
    autoApplyAlertBody:
      "Con esta opción marcada, al iniciar la oferta actualizamos vía API los precios De y Por de los productos con los valores de la tabla. Al terminar el período, restauramos los precios anteriores. Si la dejás desmarcada, los precios de la tienda no se modifican — controlamos solo la parte visual (vitrinas, banners y temporizadores).",
    enableOnSave: "Activo",
    generalSection: "Grupo",
    periodSection: "Período de la oferta",
    productsSection: "Productos de la oferta",
    filterAllCategories: "Todas las categorías",
    selectAllFromCategory: "Seleccionar todos de la categoría",
    selectAllFromCategoryNamed: "Seleccionar todos de “{name}”",
    selectProducts: "Seleccionar productos",
    configurePrices: "Configurar precios",
    configurePricesTitle: "Configurar precios de la oferta",
    configurePricesHelp:
      "Por defecto los precios de oferta empiezan iguales a los originales. Elegí un relleno y aplicá, o editá manualmente cada SKU.",
    configurePricesApply: "Aplicar modificaciones",
    resetOriginalPrices: "Usar precios originales",
    skuCount: "{count} SKUs",
    priceFrom: "De",
    priceTo: "Por",
    noDiscountConfirmTitle: "¿Guardar sin cambiar los precios?",
    noDiscountConfirmBody:
      "La aplicación automática de descuentos está activa, pero ningún precio de la tabla fue modificado. ¿Querés continuar igual? En la tienda, los valores De y Por seguirán iguales a los actuales.",
    noDiscountConfirmContinue: "Guardar de todos modos",
    applyNowConfirmTitle: "¿Actualizar precios ahora?",
    applyNowConfirmBody:
      "Este grupo está activo y dentro del período, con la aplicación automática activada. Al confirmar, los precios promocionales de los productos se actualizarán de inmediato en la tienda.",
    applyNowConfirmContinue: "Confirmar y actualizar",
    pricesAppliedToast: "Oferta guardada y precios actualizados en la tienda.",
    pricesApplyErrorToast:
      "Oferta guardada, pero hubo un error al actualizar algunos precios. Intentá de nuevo o esperá la sincronización automática.",
    displaySection: "Exhibiciones y modelos",
    theme: "Colores y estilo",
    themeHelp:
      "Definí los colores y el estilo visual usados en los componentes de la oferta (vitrina, banner y temporizadores).",
    countdownSection: "Temporizadores",
    countdownHelp:
      "Muestra la cuenta regresiva hasta el fin de la oferta en los lugares elegidos de la vitrina y de la página del producto. Al activar, elegí el modelo, el slot y mirá la previa.",
    countdownItems: "En los ítems de la vitrina",
    countdownPdp: "En la página del producto",
    countdownItemsCardTitle: "Exhibición en las vitrinas",
    countdownPdpCardTitle: "Exhibición en la página del producto",
    countdownItemsInactiveHelp:
      "Activá para mostrar el temporizador en las tarjetas de la vitrina y configurar lugar, modelo y previa.",
    countdownPdpInactiveHelp:
      "Activá para mostrar el temporizador en la página del producto y configurar lugar, modelo y previa.",
    countdownShowDays: "Mostrar días en el temporizador",
    countdownShowDaysHelp: "Elegí cómo aparece el tiempo restante en el temporizador.",
    countdownFormatHours: "Solo horas",
    countdownFormatHoursDesc: "Ej.: 53:42:18 (horas totales)",
    countdownFormatDays: "Con días",
    countdownFormatDaysDesc: "Ej.: 2d 05:42:18",
    countdownUnitDay: "Día",
    countdownUnitHour: "Hora",
    countdownUnitMin: "Min",
    countdownUnitSec: "Seg",
    countdownItemsSlot: "Lugar en la vitrina",
    countdownPdpSlot: "Lugar en la página del producto",
    countdownPreviewItems: "Previa",
    countdownPreviewPdp: "Previa",
    countdownText1: "Texto 1",
    countdownText2: "Texto 2",
    countdownTextTitle: "Textos de los modelos",
    countdownTextHelp:
      "Textos usados en los modelos (ej.: “La oferta vence en”, “Oferta por tiempo limitado” / “Aprovechá ahora”). Si está vacío, usamos el valor por defecto del modelo.",
    countdownText1Placeholder: "Ej.: La oferta vence en",
    countdownText2Placeholder: "Ej.: Aprovechá ahora",
    countdownModelPick: "Elegí el modelo del temporizador",
    countdownModelItemsBadge: "Badge de esquina",
    countdownModelItemsBadgeDesc: "Pill con timer sobre la tarjeta",
    countdownModelItemsBar: "Barra compacta",
    countdownModelItemsBarDesc: "Barra de progreso bajo el precio",
    countdownModelItemsFlash: "Flash sale",
    countdownModelItemsFlashDesc: "Pill de alta urgencia",
    countdownModelItemsInline: "Inline minimalista",
    countdownModelItemsInlineDesc: "Bloques HH:MM:SS",
    countdownModelItemsHero: "Hero timer",
    countdownModelItemsHeroDesc: "Timer grande con días/horas",
    countdownModelPdpUrgency: "Caja de urgencia",
    countdownModelPdpUrgencyDesc: "Bloque destacado con HH:MM:SS",
    countdownModelPdpInline: "Inline sutil",
    countdownModelPdpInlineDesc: "Junto al precio",
    countdownModelPdpProgress: "Progreso",
    countdownModelPdpProgressDesc: "Barra + tiempo restante",
    countdownModelPdpFloating: "Badge flotante",
    countdownModelPdpFloatingDesc: "Sello compacto de expiración",
    countdownModelPdpBanner: "Franja minimalista",
    countdownModelPdpBannerDesc: "Banner fino con timer",
    showcase: "Mostrar vitrina de la oferta",
    showcaseSection: "Vitrina",
    showcaseHelp:
      "La vitrina aparece en un lugar de la tienda (home o secciones) y muestra los productos de esta oferta con título, textos, banners y diseño (grilla o carrusel). Activá para configurar el contenido y dónde se mostrará.",
    dedicatedPage: "Mostrar página extra",
    dedicatedPageSection: "Página dedicada",
    dedicatedPageHelp:
      "La página extra publica el contenido de la oferta en una página de la tienda (URL propia), con título, textos, banners y el listado de productos. Activá para elegir la página y armar el contenido.",
    contentSection: "Vitrina y página de la oferta",
    contentSectionHelp:
      "Usá las pestañas para configurar la vitrina en la tienda y/o la página extra. Activá cada opción en el alerta para liberar el formulario.",
    contentTabShowcase: "Vitrina de oferta",
    contentTabPage: "Página extra",
    sectionActive: "Activo",
    sectionInactive: "Inactivo",
    showcaseAlertTitle: "Cómo funciona la vitrina de oferta",
    pageAlertTitle: "Cómo funciona la página extra",
    showcaseInactiveHelp:
      "Activá para mostrar la vitrina de la oferta en la tienda y configurar el contenido.",
    pageInactiveHelp:
      "Activá para publicar el contenido de la oferta en una página extra de la tienda.",
    copyFromPage: "Colocar datos de la página extra",
    copyFromShowcase: "Colocar datos de la vitrina",
    copySectionDataDone: "Datos copiados con éxito.",
    sectionTitle: "Título",
    sectionTitlePlaceholder: "Ej.: Oferta relámpago",
    sectionSubtitle: "Subtítulo",
    sectionSubtitlePlaceholder: "Ej.: Solo hasta el domingo",
    sectionTextTop: "Texto de arriba",
    sectionTextTopPlaceholder: "Texto arriba de los productos",
    sectionTextBottom: "Texto de abajo",
    sectionTextBottomPlaceholder: "Texto debajo de los productos",
    sectionBannerTop: "Banner superior",
    sectionBannerBottom: "Banner inferior",
    sectionLayout: "Diseño de productos",
    sectionLayoutGrid: "Grilla",
    sectionLayoutCarousel: "Carrusel",
    sectionItemsPerRow: "Ítems por fila",
    sectionItemsPerRowHelp:
      "En grilla define las columnas. En carrusel define el ancho aproximado de cada tarjeta.",
    banner: "Activar banner de la oferta",
    bannerSection: "Banner",
    bannerHelp:
      "Muestra una barra con temporizador en un lugar de la tienda durante el período de la oferta. Elegí el modelo y los textos inicial y final.",
    bannerCardTitle: "Exhibición del banner",
    bannerInactiveHelp:
      "Activá para mostrar la barra con temporizador en la tienda y configurar lugar, modelo y textos.",
    bannerSlot: "Lugar del banner en la tienda",
    bannerModelPick: "Modelo del banner",
    bannerModelSolid: "Barra destacada",
    bannerModelSolidDesc: "Fondo en el color principal con chip del tiempo.",
    bannerModelStrip: "Franja continua",
    bannerModelStripDesc: "Franja oscura centrada con textos y timer.",
    bannerModelSoft: "Suave",
    bannerModelSoftDesc: "Fondo claro con textos y timer en el color de la oferta.",
    bannerModelUrgent: "Urgente",
    bannerModelUrgentDesc: "Franja intensa con timer en destaque.",
    bannerText1: "Texto inicial",
    bannerText2: "Texto final",
    bannerText1Placeholder: "Ej.: Oferta por tiempo limitado",
    bannerText2Placeholder: "Ej.: Aprovechá ahora",
    bannerShowButton: "Activar link / botón en el banner",
    bannerButtonText: "Texto del botón",
    bannerButtonTextPlaceholder: "Ej.: Ver ofertas",
    bannerButtonUrl: "Link",
    bannerButtonUrlPlaceholder: "https://... o /ruta",
    bannerButtonPosition: "Posición del botón",
    bannerButtonPosition_before: "Antes del contenido",
    bannerButtonPosition_after: "Después del contenido",
    bannerButtonPosition_full: "Banner completo (solo link)",
    bannerContainer: "Limitar el ancho de la página",
    bannerTextAlign: "Alineación del contenido",
    bannerTextAlign_left: "Izquierda",
    bannerTextAlign_center: "Centro",
    bannerTextAlign_right: "Derecha",
    bannerSpacingTop: "Espaciado superior",
    bannerSpacingBottom: "Espaciado inferior",
    bannerSpacing_0: "Sin espacio",
    bannerSpacing_1: "5 px",
    bannerSpacing_2: "10 px",
    bannerSpacing_3: "15 px",
    bannerSpacing_4: "20 px",
    bannerSpacing_5: "25 px",
    bannerAnimation: "Animación",
    bannerAnimation_none: "Ninguna",
    bannerAnimation_pulse: "Pulso",
    bannerAnimation_shine: "Brillo",
    bannerAnimation_slide: "Deslizamiento",
    showcaseSlot: "Lugar de la vitrina en la tienda",
    cancel: "Cancelar",
    save: "Guardar",
  },
  subscription: {
    ...pt.subscription,
    title: "Planes y suscripciones",
    faq: "Preguntas frecuentes",
    current: "Suscripción actual",
    active: "Activa",
    inactive: "Inactiva",
    trial: "Prueba gratis",
    suspended: "Suspendida",
    goToSubscription: "Ver planes",
  },
  priceLogs: {
    ...pt.priceLogs,
    title: "Logs de sincronización de precios",
    subtitle:
      "Historial de aplicación y restauración de precios promocionales en Nuvemshop.",
    back: "Volver",
    empty: "No se encontraron logs con estos filtros.",
    emptyTitle: "Aún no hay logs de precios",
    emptyText:
      "Cuando una campaña aplique o restaure precios en Nuvemshop, el historial aparecerá aquí.",
    emptyFilteredTitle: "No se encontraron logs",
    emptyFilteredText:
      "No hay registros con los filtros o la búsqueda actuales. Ajustá los criterios o limpiá los filtros.",
    emptyClearFilters: "Limpiar filtros",
    emptyBackOffers: "Volver a ofertas",
    searchPlaceholder: "Buscar por nombre de la campaña",
    openFilters: "Filtros",
    filtersTitle: "Filtrar logs",
    applyFilters: "Aplicar filtros",
    clearFilters: "Limpiar filtros",
    results: "{count} registros",
    filterAction: "Acción",
    filterSuccess: "Resultado",
    filterDate: "Período",
    dateAll: "Todo el período",
    dateLast7: "Últimos 7 días",
    dateLast15: "Últimos 15 días",
    dateLast30: "Últimos 30 días",
    dateCustom: "Fecha inicial / final",
    dateFrom: "Fecha inicial",
    dateTo: "Fecha final",
    dateCustomHelp: "Muestra logs creados entre las fechas seleccionadas.",
    chipDate: "Período: {value}",
    chipAction: "Acción: {value}",
    chipResult: "Resultado: {value}",
    all: "Todos",
    success: "Éxito",
    failed: "Falló",
    actionApply: "Aplicar precios",
    actionRestore: "Restaurar precios",
    actionActivate: "Activar oferta",
    actionDeactivate: "Desactivar oferta",
    colWhen: "Cuándo",
    colOffer: "Campaña",
    colAction: "Acción",
    colResult: "Resultado",
    colMessage: "Detalle",
    colPricesApplied: "Precios en la tienda",
    retryRestore: "Intentar restaurar",
    retryOk: "Restore reenviado con éxito.",
    retryFail: "Error al restaurar. Revisá el nuevo log.",
    yes: "Sí",
    no: "No",
    msgApplied: "Precios aplicados",
    msgReapplied: "Precios reaplicados",
    msgRestored: "Precios restaurados",
    msgSkippedNotApplied: "Omitido: los precios no estaban aplicados",
    msgSkippedNoItems: "Omitido: campaña sin productos",
    msgStatusChange: "{from} → {to}",
    viewDetails: "Detalles",
    detailTitle: "Detalle del log",
    detailClose: "Cerrar",
    detailProducts: "Productos",
    detailVariants: "Variaciones",
    detailAttempts: "Intentos en la API",
    detailMaxAttempts: "Máximo por producto",
    detailHighestAttempt: "Mayor intento usado",
    detailAttemptRow: "Producto {productId}: {count} intento(s)",
    detailNoAttempts: "Ningún intento registrado en este log.",
    detailErrors: "Errores",
    detailNoErrors: "Ningún error devuelto.",
    detailMeta: "Metadatos",
    detailEndpoint: "Endpoint",
    detailForce: "Forzado",
    detailSource: "Origen",
    detailBug: "Error inesperado",
    detailRaw: "JSON completo",
  },
  products: {
    title: "Seleccionar productos",
    apply: "Aplicar selección",
    loading: "Cargando...",
    empty: "No se encontraron resultados.",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { pt, es };

/**
 * Resolve idioma do admin a partir de GET /store (`main_language` + `country`).
 * Lojas AR/UY/CL/MX/CO/PE etc. caem em `es` quando o language não for pt.
 */
export function resolveLocale(
  language?: string | null,
  country?: string | null,
): Locale {
  if (language) {
    const normalized = language.toLowerCase().replace("_", "-");
    if (normalized.startsWith("es")) return "es";
    if (normalized.startsWith("pt")) return "pt";
  }

  const cc = (country ?? "").toUpperCase();
  const spanishCountries = new Set([
    "AR",
    "UY",
    "CL",
    "MX",
    "CO",
    "PE",
    "EC",
    "PY",
    "BO",
    "VE",
    "CR",
    "PA",
    "GT",
    "SV",
    "HN",
    "NI",
    "DO",
  ]);
  if (spanishCountries.has(cc)) return "es";

  return "pt";
}

export function t(
  template: string,
  vars: Record<string, string | number>,
): string {
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    template,
  );
}
