/**
 * テンプレート管理と共通機能JavaScript
 * - テンプレート読み込み
 * - 共通UI機能（ヘッダー・フッターのインクルード）
 * - ナビゲーション制御
 * - スクロール処理（ヘッダー表示/非表示制御を含む）
 * - モバイルメニュー制御
 * - FAQアコーディオン
 */

(function() {
  'use strict';

  /**
   * 外部JSファイルの動的読み込み
   */
  function loadScript(src, callback) {
    // すでに読み込まれている場合はスキップしてコールバック実行
    const scripts = document.querySelectorAll('script');
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src.indexOf(src) !== -1) {
        console.log(`スクリプトはすでに読み込まれています: ${src}`);
        if (callback && typeof callback === 'function') {
          callback();
        }
        return;
      }
    }
    
    // 新規スクリプト要素の作成と追加
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    // 読み込み完了時のコールバック
    if (callback && typeof callback === 'function') {
      script.onload = function() {
        console.log(`スクリプトの読み込みが完了しました: ${src}`);
        callback();
      };
    }
    
    document.head.appendChild(script);
    console.log(`スクリプトの読み込みを開始しました: ${src}`);
  }

  /**
   * お問い合わせモーダルの読み込み
   */
  function loadContactModal(callback) {
    console.log('お問い合わせモーダルの読み込み開始');
    
    // すでに存在するか確認
    if (!document.getElementById('contact-modal')) {
      // キャッシュ無効化のためのタイムスタンプ追加
      const cacheBuster = `?_=${new Date().getTime()}`;
      fetch('/includes/contact-modal.html' + cacheBuster)
        .then(response => {
          if (!response.ok) {
            throw new Error('お問い合わせモーダルファイルの読み込みに失敗しました');
          }
          return response.text();
        })
        .then(html => {
          if (html.trim() === '') return;
          
          // モーダルHTMLをbodyに追加、ただし非表示状態に設定
          const div = document.createElement('div');
          div.innerHTML = html;
          const modalElement = div.firstElementChild;
          
          // モーダルのCSSを確実に設定
          modalElement.style.display = 'none'; // 初期は非表示
          modalElement.style.position = 'fixed';
          modalElement.style.zIndex = '9999';
          modalElement.style.left = '0';
          modalElement.style.top = '0';
          modalElement.style.width = '100%';
          modalElement.style.height = '100%';
          modalElement.style.overflow = 'auto';
          modalElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
          
          document.body.appendChild(modalElement);
          
          // モーダル関連のJSファイルが読み込まれていなければ読み込む
          loadScript('/assets/js/modal.js', function() {
            console.log('モーダルJSが読み込まれました。初期化を実行します。');
            // modal.jsが読み込まれた後に実行
            if (typeof window.initContactModal === 'function') {
              window.initContactModal();
            } else {
              console.warn('モーダル初期化関数が利用できません');
            }
            
            loadScript('/assets/js/contact-modal.js', function() {
              // contact-modal.jsが読み込まれた後、モーダル化処理を実行
              if (typeof window.convertContactLinksToModal === 'function') {
                window.convertContactLinksToModal();
                console.log('全ページのお問い合わせリンクをモーダル化しました');
              } else {
                console.error('モーダル化関数が利用できません');
              }
              
              // コールバックが定義されていれば実行
              if (callback && typeof callback === 'function') {
                callback();
              }
            });
          });
          
          console.log('お問い合わせモーダルの読み込み完了');
        })
        .catch(error => {
          console.error('お問い合わせモーダルの読み込みエラー:', error);
        });
    } else {
      // すでにモーダルが存在する場合は、リンク変換だけ実行
      if (typeof window.convertContactLinksToModal === 'function') {
        window.convertContactLinksToModal();
      }
      
      // コールバックが定義されていれば実行
      if (callback && typeof callback === 'function') {
        callback();
      }
    }
  }

  // DOM読み込み時の処理
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

  /**
   * 初期化処理
   */
  function init() {
    console.log('template.js - サイト共通処理の初期化開始');
    
    // モーダル関数の緊急定義（他の処理を待たずに即利用可能にする）
    console.log('グローバルモーダル関数を定義します');
    
    // モーダルを開く関数
    window.openContactModal = function() {
      console.log('モーダル表示関数が呼ばれました');
      
      // モーダル要素を確認
      var modal = document.getElementById('contact-modal');
      
      if (modal) {
        // モーダルがあれば直接表示
        modal.style.display = 'block';
        modal.style.position = 'fixed';
        modal.style.zIndex = '9999';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        document.body.style.overflow = 'hidden';
        console.log('モーダルを表示しました');
      } else {
        // モーダルがなければ読み込みを開始
        console.warn('モーダル要素が見つかりません。読み込みを試みます');
        
        // モーダルCSSを追加
        if (!document.querySelector('link[href*="modal.css"]')) {
          var cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = '/assets/css/modal.css';
          document.head.appendChild(cssLink);
          console.log('モーダルCSSを追加しました');
        }
        
        // モーダル要素がない場合は読み込んでから表示
        loadContactModal(function() {
          var modalAfterLoad = document.getElementById('contact-modal');
          if (modalAfterLoad) {
            modalAfterLoad.style.display = 'block';
            modalAfterLoad.style.position = 'fixed';
            modalAfterLoad.style.zIndex = '9999';
            modalAfterLoad.style.top = '0';
            modalAfterLoad.style.left = '0';
            modalAfterLoad.style.width = '100%';
            modalAfterLoad.style.height = '100%';
            modalAfterLoad.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            document.body.style.overflow = 'hidden';
            console.log('モーダル要素を読み込んで表示しました');
          } else {
            console.error('モーダルの読み込み後も要素が見つかりません');
          }
        });
      }
    };
    
    // モーダルを閉じる関数
    window.closeModal = function() {
      var modal = document.getElementById('contact-modal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        console.log('モーダルを閉じました');
      }
    };
    
    // テンプレート読み込み
    initTemplates();
    
    // お問い合わせモーダルの読み込み（全ページ共通）
    loadContactModal();
    
    // UI共通処理
    initMobileMenu();
    initSmoothScroll();
    initHeaderScroll();
    initFAQ();
    
    // 共通UIコンポーネント初期化
    if (typeof loadComponents === 'function') {
      loadComponents();
    }
    
    console.log('template.js - 初期化完了');
  }
  
  /* ====================================
   * テンプレート読み込み機能
   * ==================================== */
  
  /**
   * テンプレートの初期化と読み込み
   */
  function initTemplates() {
    console.log('統合テンプレートローダー起動');
    
    // 統合テンプレートファイルを一度だけ読み込む
    loadTemplatesFile('/assets/includes/templates.html')
      .then(templatesDoc => {
        // 各コンポーネントを適用
        // パターン1: メインページ用
        applyTemplateFromDocument('site-header', 'header-template', templatesDoc);
        applyTemplateFromDocument('breadcrumb-container', 'breadcrumb-template', templatesDoc);
        applyTemplateFromDocument('site-footer', 'footer-template', templatesDoc);
        
        // パターン2: プライバシーポリシー・特商法ページ用
        applyTemplateFromDocument('header-include', 'header-template', templatesDoc);
        applyTemplateFromDocument('breadcrumb-include', 'breadcrumb-template', templatesDoc);
        applyTemplateFromDocument('footer-include', 'footer-template', templatesDoc);
      })
      .catch(error => {
        console.error('テンプレートの読み込みに失敗しました:', error);
        // エラー時のフォールバック処理
        fallbackTemplateLoad();
      });
  }

  /**
   * 指定したコンポーネントを読み込む関数
   * @param {Object} components - コンポーネント名とセレクターのマッピング
   */
  function loadComponents(components) {
    console.log('カスタムコンポーネントローダー起動', components);
    
    if (!components) {
      // 引数なしの場合はデフォルトのコンポーネントを読み込む
      initTemplates();
      return;
    }
    
    // 統合テンプレートファイルを読み込む
    loadTemplatesFile('/assets/includes/templates.html')
      .then(templatesDoc => {
        // 各コンポーネントを指定されたセレクタに適用
        Object.entries(components).forEach(([componentName, selector]) => {
          // セレクタから先頭の#を除去してIDを取得
          const targetId = selector.startsWith('#') ? selector.substring(1) : selector;
          const templateId = `${componentName}-template`;
          
          console.log(`コンポーネント「${componentName}」を「${targetId}」に適用します`);
          applyTemplateFromDocument(targetId, templateId, templatesDoc);
        });
        
        // パンくずリストの生成を明示的に呼び出す（ブレッドクラムが含まれている場合）
        if (components.breadcrumb) {
          console.log('パンくずリスト生成を実行します');
          setTimeout(() => {
            generateBreadcrumb();
          }, 100); // 少し遅延させて確実にDOM要素が追加された後に実行
        }
      })
      .catch(error => {
        console.error('テンプレートの読み込みに失敗しました:', error);
        // エラー時のフォールバック処理
        fallbackTemplateLoad();
      });
  }
  
  /**
   * テンプレート読み込み失敗時のフォールバック処理
   * 個別のファイルを直接読み込む
   */
  function fallbackTemplateLoad() {
    console.warn('フォールバックテンプレートローダーを起動します');
    
    // パターン1: メインページ用
    const mainHeaderContainer = document.getElementById('site-header');
    const mainFooterContainer = document.getElementById('site-footer');
    const mainBreadcrumbContainer = document.getElementById('breadcrumb-container');
    
    // パターン2: プライバシーポリシー・特商法ページ用
    const subHeaderContainer = document.getElementById('header-include');
    const subFooterContainer = document.getElementById('footer-include');
    const subBreadcrumbContainer = document.getElementById('breadcrumb-include');
    
    // モーダル要素をbodyに追加
    loadContactModal();
    
    // ヘッダーの読み込み
    function loadHeader(container) {
      if (!container) return;
      
      fetch('/includes/header-include.html')
        .then(response => {
          if (!response.ok) {
            throw new Error('ヘッダーファイルの読み込みに失敗しました');
          }
          return response.text();
        })
        .then(html => {
          if (html.trim() === '') {
            container.style.display = 'none';
            return;
          }
          container.innerHTML = html;
          // ヘッダー読み込み後の処理
          setActiveMenuItem();
          initMobileMenu();
        })
        .catch(error => {
          console.error('ヘッダーファイルの読み込みエラー:', error);
          container.style.display = 'none';
        });
    }
    
    // パンくずリストの読み込み
    function loadBreadcrumb(container) {
      if (!container) return;
      
      fetch('/includes/breadcrumb-include.html')
        .then(response => {
          if (!response.ok) {
            throw new Error('パンくずリストファイルの読み込みに失敗しました');
          }
          return response.text();
        })
        .then(html => {
          if (html.trim() === '') {
            container.style.display = 'none';
            return;
          }
          container.innerHTML = html;
          // パンくず読み込み後の処理
          generateBreadcrumb();
        })
        .catch(error => {
          console.error('パンくずリストファイルの読み込みエラー:', error);
          container.style.display = 'none';
        });
    }
    
    // フッターの読み込み
    function loadFooter(container) {
      if (!container) return;
      
      fetch('/includes/footer-include.html')
        .then(response => {
          if (!response.ok) {
            throw new Error('フッターファイルの読み込みに失敗しました');
          }
          return response.text();
        })
        .then(html => {
          if (html.trim() === '') {
            container.style.display = 'none';
            return;
          }
          container.innerHTML = html;
        })
        .catch(error => {
          console.error('フッターファイルの読み込みエラー:', error);
          container.style.display = 'none';
        });
    }
    
    // お問い合わせモーダルの読み込み
    function loadContactModal(callback) {
      console.log('お問い合わせモーダルの読み込み開始');
      
      // すでに存在するか確認
      if (!document.getElementById('contact-modal')) {
        // キャッシュ無効化のためのタイムスタンプ追加
        const cacheBuster = `?_=${new Date().getTime()}`;
        fetch('/includes/contact-modal.html' + cacheBuster)
          .then(response => {
            if (!response.ok) {
              throw new Error('お問い合わせモーダルファイルの読み込みに失敗しました');
            }
            return response.text();
          })
          .then(html => {
            if (html.trim() === '') return;
            
            // モーダルHTMLをbodyに追加
            const div = document.createElement('div');
            div.innerHTML = html;
            document.body.appendChild(div.firstElementChild);
            
            // モーダル関連のJSファイルが読み込まれていなければ読み込む
            loadScript('/assets/js/modal.js', function() {
              console.log('モーダルJSが読み込まれました。初期化を実行します。');
              // サイト全体で利用するお問い合わせフォーム用モーダルの初期化
              loadContactModal(function() {
                // モーダル初期化
                if (typeof window.initContactModal === 'function') {
                  window.initContactModal();
                  console.log('モーダル初期化関数を実行しました');
                } else {
                  console.error('モーダル初期化関数が見つかりません');
                }
                
                // CTAボタンとお問い合わせリンクの一元管理
                function setupModalTriggers() {
                  // ヘッダーCTAボタンと各セクションのCTAボタン設定
                  const allCtaButtons = document.querySelectorAll('.header-cta, .cta-button, a.btn, .btn');
                  if (allCtaButtons.length > 0) {
                    allCtaButtons.forEach(button => {
                      // 一度だけ設定するためのチェック
                      if (!button.hasAttribute('data-modal-listener')) {
                        button.setAttribute('data-modal-listener', 'true');
                        button.addEventListener('click', function(e) {
                          e.preventDefault();
                          console.log('CTAボタンがクリックされました');
                          if (typeof window.openContactModal === 'function') {
                            window.openContactModal();
                          } else {
                            console.error('openContactModal 関数が定義されていません (CTAボタン)');
                          }
                        });
                      }
                    });
                    console.log('CTAボタンリスナー設定完了: ' + allCtaButtons.length + '個');
                  } else {
                    console.warn('CTAボタンが見つかりませんでした');
                  }
                  
                  // フッターお問い合わせリンク設定、より広いセレクタで対応
                  const footerLinks = document.querySelectorAll('footer a');
                  const footerContactLinks = Array.from(footerLinks).filter(link => {
                    const href = (link.getAttribute('href') || '').toLowerCase();
                    const text = (link.textContent || '').trim();
                    return href.includes('contact') || text.includes('お問い合わせ');
                  });
                  if (footerContactLinks.length > 0) {
                    footerContactLinks.forEach(link => {
                      // 一度だけ設定するためのチェック
                      if (!link.hasAttribute('data-modal-listener')) {
                        link.setAttribute('data-modal-listener', 'true');
                        link.addEventListener('click', function(e) {
                          e.preventDefault();
                          console.log('フッターお問い合わせリンクがクリックされました');
                          if (typeof window.openContactModal === 'function') {
                            window.openContactModal();
                          } else {
                            console.error('openContactModal 関数が定義されていません (フッターリンク)');
                          }
                        });
                      }
                    });
                    console.log('フッターお問い合わせリンク設定完了: ' + footerContactLinks.length + '個');
                  } else {
                    console.warn('フッターお問い合わせリンクが見つかりませんでした');
                  }
                  
                  // 全てのお問い合わせリンクをモーダル化
                  const allLinks = document.querySelectorAll('a');
                  const allContactLinks = Array.from(allLinks).filter(link => {
                    const href = (link.getAttribute('href') || '').toLowerCase();
                    const text = (link.textContent || '').trim();
                    return href.includes('contact') || text.includes('お問い合わせ');
                  });
                  if (allContactLinks.length > 0) {
                    allContactLinks.forEach(link => {
                      // 二重登録防止とフッター以外のお問い合わせリンクの処理
                      if (!link.closest('footer') && !link.hasAttribute('data-modal-listener')) {
                        link.setAttribute('data-modal-listener', 'true');
                        link.addEventListener('click', function(e) {
                          e.preventDefault();
                          console.log('お問い合わせリンクがクリックされました');
                          if (typeof window.openContactModal === 'function') {
                            window.openContactModal();
                          } else {
                            console.error('openContactModal 関数が定義されていません (一般リンク)');
                          }
                        });
                      }
                    });
                    console.log('全てのお問い合わせリンク設定完了');
                  }
                }
                
                // トリガー設定を実行
                setupModalTriggers();
                
                // DOM変更監視で動的に追加される要素にも対応
                setTimeout(setupModalTriggers, 1000);
              });
            });
            
            console.log('お問い合わせモーダルの読み込み完了');
          })
          .catch(error => {
            console.error('お問い合わせモーダルの読み込みエラー:', error);
          });
      } else {
        // すでにモーダルが存在する場合は、リンク変換だけ実行
        if (typeof window.convertContactLinksToModal === 'function') {
          window.convertContactLinksToModal();
        }
        
        // コールバックが定義されていれば実行
        if (callback && typeof callback === 'function') {
          callback();
        }
      }
    }
    
    // 外部JSファイルの動的読み込み
    function loadScript(src, callback) {
      // すでに読み込まれている場合はスキップしてコールバック実行
      const scripts = document.querySelectorAll('script');
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src.indexOf(src) !== -1) {
          console.log(`スクリプトはすでに読み込まれています: ${src}`);
          if (callback && typeof callback === 'function') {
            callback();
          }
          return;
        }
      }
      
      // 新規スクリプト要素の作成と追加
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      
      // 読み込み完了時のコールバック
      if (callback && typeof callback === 'function') {
        script.onload = function() {
          console.log(`スクリプトの読み込みが完了しました: ${src}`);
          callback();
        };
      }
      
      document.head.appendChild(script);
      console.log(`スクリプトの読み込みを開始しました: ${src}`);
    }
    
    // 各コンポーネントの読み込みを実行
    // パターン1: メインページ用
    loadHeader(mainHeaderContainer);
    loadBreadcrumb(mainBreadcrumbContainer);
    loadFooter(mainFooterContainer);
    
    // パターン2: プライバシーポリシー・特商法ページ用
    loadHeader(subHeaderContainer);
    loadBreadcrumb(subBreadcrumbContainer);
    loadFooter(subFooterContainer);
  }
  
  /**
   * テンプレートファイルを読み込んでDOMパーサーで解析
   * @param {string} templatePath - テンプレートファイルのパス
   * @returns {Promise<Document>} - テンプレートを含むDocumentオブジェクト
   */
  function loadTemplatesFile(templatePath) {
    // キャッシュ無効化のためにタイムスタンプを追加
    const cacheBuster = `?_=${new Date().getTime()}`;
    return fetch(`${templatePath}${cacheBuster}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`テンプレートの読み込みに失敗: ${templatePath} (${response.status})`);
        }
        return response.text();
      })
      .then(html => {
        const parser = new DOMParser();
        return parser.parseFromString(html, 'text/html');
      });
  }
  
  /**
   * 読み込んだテンプレートドキュメントから特定のテンプレートを取得して適用
   * @param {string} targetId - 対象要素のID
   * @param {string} templateId - テンプレート要素のID
   * @param {Document} templatesDoc - テンプレートを含むドキュメント
   */
  function applyTemplateFromDocument(targetId, templateId, templatesDoc) {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) {
      console.log(`要素 ${targetId} が見つかりません`);
      return;
    }
    
    const templateElement = templatesDoc.getElementById(templateId);
    if (!templateElement) {
      console.error(`テンプレート ${templateId} が見つかりません`);
      return;
    }
    
    targetElement.innerHTML = templateElement.innerHTML;
    console.log(`${targetId} にテンプレート ${templateId} を適用しました`);
    
    // コンポーネント読み込み後の処理
    if (targetId === 'breadcrumb-container') {
      generateBreadcrumb();
    } else if (targetId === 'site-header') {
      setActiveMenuItem();
      initMobileMenu();
    } else if (targetId === 'header-include') {
      setActiveMenuItem();
      initMobileMenu();
    }
    
    // イベント発火
    const event = new CustomEvent('component-loaded', { detail: { id: targetId } });
    document.dispatchEvent(event);
  }

  /**
   * パンくずリストの生成
   */
  function generateBreadcrumb() {
    // 各ページのID構造に対応
    let breadcrumbContainer = document.getElementById('breadcrumb-container');
    let breadcrumbList = null;
    
    // パターン1: メインページ用
    if (breadcrumbContainer) {
      breadcrumbList = document.querySelector('#breadcrumb-container .container ul');
      console.log('メインパターンのパンくずリストを使用します');
    } 
    // パターン2: プライバシーポリシー・特商法ページ用
    else {
      breadcrumbContainer = document.getElementById('breadcrumb-include');
      
      if (breadcrumbContainer) {
        // プライバシーポリシーページの場合、まずテンプレートを適用する
        console.log('プライバシーページ用パンくずリストを作成します');
        
        // テンプレートを適用
        const template = document.getElementById('breadcrumb-template');
        if (template) {
          // テンプレートの内容をクローンして適用
          const clone = document.importNode(template.content, true);
          breadcrumbContainer.appendChild(clone);
          
          // 適用後、ul要素を取得
          breadcrumbList = breadcrumbContainer.querySelector('ul#breadcrumb-list');
          console.log('パンくずリスト要素を取得:', breadcrumbList);
        } else {
          console.log('パンくずリストのテンプレートが見つかりません');
        }
        
        // ulが存在しない場合は作成する
        if (!breadcrumbList) {
          breadcrumbList = document.createElement('ul');
          breadcrumbList.id = 'breadcrumb-list';
          breadcrumbContainer.appendChild(breadcrumbList);
          console.log('パンくずリストのul要素を作成しました');
        }
      }
    }
    
    if (!breadcrumbContainer) {
      console.log('パンくずリストコンテナが見つかりません');
      return;
    }
    
    if (!breadcrumbList) {
      console.log('パンくずリストのUL要素が見つかりません');
      return;
    }
    
    console.log('パンくずリスト生成開始');
    
    // ホーム（常に最初の項目）
    let html = '<li><a href="/">ホーム</a></li>';
    
    // URLのパスからパンくずを生成
    const path = window.location.pathname;
    const pathSegments = path.split('/').filter(segment => segment);
    
    // 現在のページデータを取得
    const pageData = breadcrumbContainer.getAttribute('data-page');
    console.log(`パンくずリストのページデータ: ${pageData}`);
    
    // 記事タイプの判別（article/manual）
    let articleType = '';
    if (path.includes('/article/')) {
      articleType = 'article';
      // Howto BOXがパンくずに含まれていない場合は追加
      if (!html.includes('Howto BOX')) {
        html += '<li><a href="/howto/">Howto BOX</a></li>';
      }
      html += '<li><a href="/howto/article/">ノウハウ記事</a></li>';
    } else if (path.includes('/manual/')) {
      articleType = 'manual';
      // Howto BOXがパンくずに含まれていない場合は追加
      if (!html.includes('Howto BOX')) {
        html += '<li><a href="/howto/">Howto BOX</a></li>';
      }
      html += '<li><a href="/howto/manual/">マニュアル</a></li>';
    }
    
    console.log(`記事タイプ: ${articleType}`);
    
    // 記事ページの場合は新しいパンくず生成ロジックを使用
    if (articleType) {
      // 最後の要素は現在の記事タイトル
      // カスタムタイトルがあれば使用、なければページID
      if (pageData) {
        html += `<li><span>${getPageTitle(pageData)}</span></li>`;
      } else {
        // URLから記事IDを取得
        const articleId = getArticleIdFromPath(path);
        html += `<li><span>${getPageTitle(articleId)}</span></li>`;
      }
    } else {
      // 従来の通常ページのパンくず生成
      let currentPath = '';
      for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        // index.htmlを無視
        if (segment === 'index.html') continue;
        
        currentPath += '/' + segment;
        console.log(`パンくずパス処理: ${segment} (${currentPath})`);
        
        // 最後の要素（現在のページ）はリンクなし
        if (i === pathSegments.length - 1) {
          // カスタムタイトルがあれば使用
          if (pageData) {
            html += `<li><span>${getPageTitle(pageData)}</span></li>`;
          } else {
            html += `<li><span>${getPageTitle(segment)}</span></li>`;
          }
        } else {
          // 特別なリンク処理
          let linkPath = currentPath + '/';
          
          // postsセグメントの場合は全記事一覧ページへ
          if (segment === 'posts') {
            linkPath = '/howto/allpost/';
          } 
          // manualセグメントの場合はマニュアル一覧ページへ
          else if (segment === 'manual') {
            linkPath = '/howto/allpost/manual/';
          }
          // articleセグメントの場合はノウハウ記事一覧ページへ
          else if (segment === 'article') {
            linkPath = '/howto/allpost/article/';
          }
          
          html += `<li><a href="${linkPath}">${getPageTitle(segment)}</a></li>`;
        }
      }
    }
    
    breadcrumbList.innerHTML = html;
    console.log('パンくずリスト生成完了');
  }
  
  /**
   * URLパスから記事IDを取得
   * @param {string} path - URLパス
   * @returns {string} - 記事ID
   */
  function getArticleIdFromPath(path) {
    const segments = path.split('/').filter(segment => segment);
    // 最後のセグメントがindex.htmlの場合は、その前のセグメントを記事IDとする
    if (segments.length > 0) {
      if (segments[segments.length - 1] === 'index.html') {
        return segments[segments.length - 2] || '';
      }
      return segments[segments.length - 1];
    }
    return '';
  }

  /**
   * FAQアコーディオン機能の初期化
   */
  function initFAQ() {
    console.log('FAQアコーディオン初期化開始');
    
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length === 0) {
      console.log('FAQ要素が存在しません');
      return;
    }
    
    console.log(`FAQ項目数: ${faqItems.length}`);
    
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      
      if (!question || !answer) return;
      
      // デフォルトでは閉じておく
      answer.style.display = 'none';
      
      question.addEventListener('click', () => {
        // トグルアイコンの切り替え
        const toggleIcon = question.querySelector('.toggle-icon');
        if (toggleIcon) {
          // HTMLエンティティを使用して正しく表示されるようにする
          if (toggleIcon.textContent === '+') {
            toggleIcon.innerHTML = '&minus;';
          } else {
            toggleIcon.innerHTML = '&plus;';
          }
        }
        
        // アンサーの表示切り替え
        const isVisible = answer.style.display === 'block';
        answer.style.display = isVisible ? 'none' : 'block';
        
        // アクティブクラスの切り替え
        item.classList.toggle('active');
      });
    });
    
    console.log('FAQアコーディオン初期化完了');
  }

  /**
   * パスセグメントからページタイトルを取得
   */
  function getPageTitle(segment) {
    // URLパスから表示名へのマッピング
    const titleMap = {
        'ec-growth-d-2': '顧客対応を甘く見るな。自社ECは、対応ひとつで売上を落とす',
        'ec-growth-d-1': 'プラグインを入れすぎたECは、売れてから詰む',
        'ec-growth-c-2': 'CPAしか見れない経営者の末路',
        'ec-growth-c-1': '広告を回すだけのECは、大体売れません。',
        'ec-growth-b-3': 'そのEC、社内の誰でも迷わず更新できますか？',
        'ec-growth-b-2': '売れない罠。デザインはキレイ、でも編集しづらい。',
        'ec-growth-a-2': '自社ECが伸びないのは、本当に広告のせいですか？',
        'web-marketing-a-5': 'SNSを頑張っているのに売れないECの典型パターン',
        'web-marketing-a-4': '自社ECを始めたのに成果が出ない企業が最初にハマる落とし穴',
        'web-marketing-a-1': 'Shopifyで売れないのは本当に集客の問題なのか？',
        'ec-growth-b-1': 'そのサイト、作った後も社内で運用できますか？',
        'ec-growth-a-4': 'ECを始めたのに、成果が出ない企業の体質',
        'ec-growth-a-3': '広告費をかけても売れない。どこで止まっている？',
        'ec-growth-a-1': '初月から伸びるECサイトは、何が違うのか？',
        'web-marketing-a-3': '広告を回しているのに売れないECに共通する設計ミス',
        'ec-growth': '初月1000万円規模の売上を作ってきたチームが語る、EC構築の現実',
        'web-marketing': '自社ECが伸びない本当の理由',
        'web-marketing-b-1': 'ECで成果が出る企業が、必ず最初にやっている「整理」とは何か',
      'howto': 'Howto BOX',
      'howto-posts': 'すべての記事一覧',
      'posts': '記事一覧',
      'manual': 'マニュアル',
      'article': 'ノウハウ記事',
      'allpost': '記事一覧',
      // ノウハウ記事のタイトル
      'article1': 'WEBマーケ×クリエイティブ戦略で売上UP！',
      'article2': '静岡＆神奈川でWeb制作を依頼するなら？',
      'article3': 'EC集客方法まとめ',
      'article4': 'SNS運用ノウハウ',
      'article5': 'SEO対策基礎知識',
      'article6': 'Web広告運用テクニック',
      // Wixマニュアル記事のタイトル
      'wix1': '01. はじめに',
      'wix2': '02. 基本操作の前提知識',
      'wix3': '03. テキストやフレームパーツの再利用・編集',
      'wix4': '04. ページ複製と設定（SEO含む）',
      'wix5': '05. レスポンシブ編集方法',
      'wix6': '06. 予約サービス／カレンダー（基本操作）',
      'wix7': '07. EC商品の編集と複製登録（Wixストア）',
      'wix8': '08. ブログ記事の作成と設定（HTMLデザイン活用）',
      // その他のページ
      'works': '実績事例',
      'services': 'サービス一覧',
      'pricing': '料金案内',
      'process': '制作までの流れ',
      'company': '会社概要',
      'profile': 'プロフィール',
      'contact': 'お問い合わせ',
      'recruit': '採用情報',
      'new-graduate': '新卒採用｜プロジェクトマネージャー候補',
      'figma-designer': 'デザイナー募集（Figma / LP・広告バナー）',
      'ai-generation': 'AI画像生成・バナー制作スタッフ募集'
    };
    
    return titleMap[segment] || segment;
  }

  /**
   * ヘッダーの現在のページをアクティブに
   */
  function setActiveMenuItem() {
    console.log('ヘッダーアクティブ項目設定開始');
    
    const path = window.location.pathname;
    const pathSegments = path.split('/').filter(segment => segment);
    
    if (pathSegments.length > 0) {
      const mainSection = pathSegments[0];
      console.log(`現在のセクション: ${mainSection}`);
      
      const menuItems = document.querySelectorAll('.global-nav a');
      
      menuItems.forEach(item => {
        const href = item.getAttribute('href') || '';
        if (href && href.includes('/' + mainSection + '/')) {
          item.classList.add('active');
          console.log(`アクティブ項目設定: ${href}`);
        }
      });
    }
  }

  /* ====================================
   * UI共通処理
   * ==================================== */

  function toggleMobileMenuFromToggle(toggle) {
    if (!toggle) return;
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenu) return;

    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));

    if (expanded) {
      mobileMenu.setAttribute('hidden', '');
      mobileMenu.classList.add('hidden');
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
      toggle.classList.remove('is-active');
      toggle.classList.remove('active');
    } else {
      mobileMenu.removeAttribute('hidden');
      mobileMenu.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      document.body.classList.add('menu-open');
      toggle.classList.add('is-active');
      toggle.classList.add('active');
    }
  }

  // onclickフォールバック用（イベント伝播に依存しない）
  window.toggleMobileMenu = function(toggle) {
    toggleMobileMenuFromToggle(toggle);
  };

  /**
   * モバイルメニューの初期化
   */
  function initMobileMenu() {
    // イベント委譲で確実に拾う（テンプレ挿入でDOMが差し替わっても動作させる）
    if (document.documentElement.getAttribute('data-mobile-menu-delegated') === 'true') return;
    document.documentElement.setAttribute('data-mobile-menu-delegated', 'true');

    function handleMobileMenuEvent(e) {
      const toggle = e.target.closest('.mobile-menu-toggle');
      const mobileMenu = document.getElementById('mobile-menu');

      // トグルボタン
      if (toggle) {
        // onclickフォールバックがある場合はそちらに任せる（委譲側で二重トグルすると開→即閉になる）
        if (toggle.getAttribute('onclick')) return;
        toggleMobileMenuFromToggle(toggle);
        return;
      }

      // メニュー内リンク
      const menuLink = e.target.closest('#mobile-menu a');
      if (menuLink) {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        // 遷移（clickのデフォルト動作）を阻害しないよう、閉じ処理は遅延
        setTimeout(() => {
          if (mobileMenu) {
            mobileMenu.setAttribute('hidden', '');
            mobileMenu.classList.add('hidden');
          }
          if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.classList.remove('is-active');
            menuToggle.classList.remove('active');
          }
          document.body.style.overflow = '';
          document.body.classList.remove('menu-open');
        }, 0);
      }
    }

    // captureで拾う（途中でstopPropagationされても拾える）
    document.addEventListener('click', handleMobileMenuEvent, true);

    // リサイズ時の処理（PCサイズになった時にモバイルメニューを閉じる）
    window.addEventListener('resize', function() {
      if (window.innerWidth > 992) {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileMenu) {
          mobileMenu.setAttribute('hidden', '');
          mobileMenu.classList.add('hidden');
        }
        if (menuToggle) {
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.classList.remove('is-active');
          menuToggle.classList.remove('active');
        }
        document.body.style.overflow = '';
        document.body.classList.remove('menu-open');
      }
    });
  }
  
  /**
   * スムーススクロールの初期化
   */
  function initSmoothScroll() {
    // アンカーリンクのクリックイベント
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // #のみのリンクは何もしない
        if (href === '#') return;
        
        e.preventDefault();
        
        const target = document.querySelector(href);
        if (!target) return;
        
        // モバイルメニューが開いていたら閉じる
        const mobileMenu = document.getElementById('mobile-menu');
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileMenu && !mobileMenu.hasAttribute('hidden')) {
          mobileMenu.setAttribute('hidden', '');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.classList.remove('is-active');
          document.body.style.overflow = '';
        }
        
        // ヘッダーの高さを取得
        const headerHeight = window.innerWidth <= 992 
          ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height-mobile'))
          : parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'));
        
        // スクロール位置の計算
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = targetPosition - headerHeight;
        
        // スムーススクロール
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      });
    });
  }
  
  /**
   * ヘッダースクロールの初期化
   * スクロール時にヘッダーのスタイルを変更し、スクロール方向に応じて表示/非表示を制御
   */
  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    
    // スクロール制御のための変数
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // スクロール方向を検出
      if (scrollTop > lastScrollTop && scrollTop > 200) {
        // 下にスクロール - ヘッダーを隠す
        header.classList.add('header-hidden');
      } else {
        // 上にスクロール - ヘッダーを表示
        header.classList.remove('header-hidden');
      }
      
      // スクロール位置に応じたヘッダースタイル変更
      if (scrollTop > 50) {
        header.classList.add('header-scrolled');
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('header-scrolled');
        header.classList.remove('is-scrolled');
      }
      
      lastScrollTop = scrollTop;
    });
  }
})();

// ─── 記事CTAボックスを共通インクルードで一括置換 ───
document.addEventListener('DOMContentLoaded', function () {
  const ctaBoxes = document.querySelectorAll('.cta-box');
  if (ctaBoxes.length > 0) {
    fetch('/assets/includes/article-cta.html')
      .then(function (r) { return r.text(); })
      .then(function (html) {
        ctaBoxes.forEach(function (box) { box.innerHTML = html; });
      })
      .catch(function () {});
  }
});

// ─── 筆者プロフィールを共通インクルードで自動挿入 ───
document.addEventListener('DOMContentLoaded', function () {
  const profileContainer = document.getElementById('profile-container');
  if (!profileContainer) return;
  fetch('/assets/includes/author-profile.html')
    .then(function (r) { return r.text(); })
    .then(function (html) {
      profileContainer.innerHTML = html;
    })
    .catch(function () {});
});
