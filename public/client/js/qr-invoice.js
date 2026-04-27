(function () {
    function formatCurrency(value) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(Number(value) || 0);
    }

    function isVietQrPayment(method) {
        return String(method || '').toUpperCase() === 'VIETQR';
    }

    async function generateVietQr(orderId, totalAmount) {
        const params = new URLSearchParams({
            orderId: String(orderId),
            totalAmount: String(totalAmount),
            orderCode: `ORDER_${orderId}`
        });

        const response = await fetch(`http://localhost:10000/api/qr-code/generate?${params.toString()}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Khong tao duoc ma QR, vui long thu lai.');
        }

        const payload = await response.json();
        if (payload.code !== '00' || !payload.data || !payload.data.qrDataURL) {
            throw new Error('Khong tao duoc ma QR, vui long thu lai.');
        }

        return payload.data;
    }

    function renderInvoiceHtml({ orderId, totalAmount, qrDataURL, errorMessage }) {
        return `
            <div class="qr-invoice-box">
                <div class="qr-invoice-meta">
                    <div class="qr-meta-item">
                        <span class="qr-meta-label">Ma don hang</span>
                        <strong>#${orderId}</strong>
                    </div>
                    <div class="qr-meta-item">
                        <span class="qr-meta-label">Tong tien</span>
                        <strong>${formatCurrency(totalAmount)}</strong>
                    </div>
                </div>

                ${qrDataURL ? `
                    <div class="qr-image-wrap">
                        <img src="${qrDataURL}" alt="QR thanh toán đơn hàng #${orderId}" class="qr-image" />
                    </div>
                ` : `
                    <div class="qr-error-box">${errorMessage || 'Khong tao duoc ma QR, vui long thu lai.'}</div>
                `}

                <div class="qr-invoice-note">
                    Vui long mo ung dung ngan hang ho tro VietQR, quet ma va kiem tra dung ma don truoc khi xac nhan thanh toan.
                </div>
            </div>
        `;
    }

    function showQrModal({ orderId, totalAmount, qrDataURL, errorMessage }) {
        const container = document.getElementById('vietQrInvoiceBody');
        const modalElement = document.getElementById('vietQrModal');

        if (!container || !modalElement || !window.bootstrap) {
            return;
        }

        container.innerHTML = renderInvoiceHtml({ orderId, totalAmount, qrDataURL, errorMessage });
        const modal = window.bootstrap.Modal.getOrCreateInstance(modalElement);
        modal.show();
    }

    window.QRInvoice = {
        formatCurrency,
        isVietQrPayment,
        generateVietQr,
        showQrModal
    };
})();
