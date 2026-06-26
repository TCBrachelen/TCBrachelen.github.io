(function () {
    const currentScript = document.currentScript;
    const legalSource = currentScript?.dataset?.legalSrc || 'rechtliches.html';
    let legalDocumentPromise = null;

    function getLegalModalElements() {
        return {
            modal: document.getElementById('modal-legal'),
            title: document.getElementById('legal-modal-title'),
            body: document.getElementById('legal-modal-body')
        };
    }

    async function loadLegalDocument() {
        if (!legalDocumentPromise) {
            legalDocumentPromise = fetch(legalSource, { cache: 'no-cache' })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('HTTP ' + response.status);
                    }
                    return response.text();
                })
                .then(html => new DOMParser().parseFromString(html, 'text/html'));
        }

        return legalDocumentPromise;
    }

    window.openLegalModal = async function (type) {
        const { modal, title, body } = getLegalModalElements();

        if (!modal || !title || !body) {
            console.error('Das zentrale Rechts-Modal ist in dieser Seite nicht vorhanden.');
            return;
        }

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        title.textContent = 'Wird geladen …';
        body.innerHTML = '<p>Der Inhalt wird geladen.</p>';

        try {
            const doc = await loadLegalDocument();
            const section = doc.getElementById('legal-' + type);

            if (!section) {
                throw new Error('Abschnitt nicht gefunden: legal-' + type);
            }

            title.textContent = section.dataset.title || '';
            body.innerHTML = section.innerHTML;
        } catch (error) {
            console.error(error);
            title.textContent = 'Inhalt nicht verfügbar';
            body.innerHTML = '<p>Die rechtlichen Informationen konnten nicht geladen werden. Bitte laden Sie die Seite neu oder öffnen Sie die Informationen direkt über die Datei <a href="' + legalSource + '">rechtliches.html</a>.</p>';
        }
    };

    window.closeLegalModal = function () {
        const { modal } = getLegalModalElements();

        if (modal) {
            modal.classList.remove('open');
        }

        document.body.style.overflow = '';
    };

    document.addEventListener('click', function (event) {
        const { modal } = getLegalModalElements();

        if (modal && event.target === modal) {
            window.closeLegalModal();
        }
    });

    document.addEventListener('keydown', function (event) {
        const { modal } = getLegalModalElements();

        if (event.key === 'Escape' && modal && modal.classList.contains('open')) {
            window.closeLegalModal();
        }
    });
})();
