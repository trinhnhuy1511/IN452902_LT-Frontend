// Câu 2: viết JavaScript tại đây

const API_URL = 'http://localhost:4000';

// Hàm có sẵn: đổi giờ UTC sang giờ Việt Nam, vd "08:00 12/09/2026"
const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

const byId = (id) => document.getElementById(id);

// Tạo một phần tử với thuộc tính và nội dung chữ (nếu có)
const buildNode = (tag, attrs = {}, text = '') => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (text) node.textContent = text;
    return node;
};

// Số chỗ còn lại của một sự kiện
const seatsLeft = (event) => event.capacity - event.registeredCount;

// Hàm formatSeats(event) trả về chuỗi số chỗ ngồi
const formatSeats = (event) => {
    const left = seatsLeft(event);
    return left > 0 ? `Còn ${left}/${event.capacity} chỗ` : 'Hết chỗ';
};

//Hàm renderEvents(events) tạo card bằng createElement và thay thế nội dung
const renderEvents = (events) => {
    const listEl = byId('event-list');
    const cards = [];

    for (const ev of events) {
        const isFull = seatsLeft(ev) <= 0;
        const card = buildNode('article', { class: 'event-card' });

        if (isFull) {
            card.appendChild(buildNode('span', { class: 'badge-full' }, 'Hết chỗ'));
        }

        const thumb = buildNode('img', { src: 'img/event.svg', alt: ev.name });
        const link = buildNode('a', { href: `event-detail.html?id=${ev.id}` }, ev.name);
        const when = buildNode('time', { datetime: ev.startTime }, formatDateTime(ev.startTime));
        const place = buildNode('p', {}, ev.location);
        const seatInfo = buildNode('p', { class: isFull ? 'seats full' : 'seats' }, formatSeats(ev));

        card.append(thumb, link, when, place, seatInfo);
        cards.push(card);
    }

    listEl.replaceChildren(...cards);
};

// Hàm async loadEvents(keyword) gọi API và xử lý trạng thái
const loadEvents = async (keyword = '') => {
    const statusEl = byId('status');
    const listEl = byId('event-list');
    const term = keyword.trim();

    statusEl.textContent = 'Đang tải...';

    try {
        const query = new URLSearchParams({ pageSize: 50 });
        if (term) query.set('q', term);

        const res = await fetch(`${API_URL}/api/events?${query}`);
        if (!res.ok) throw new Error('Lỗi máy chủ');

        const { items = [] } = await res.json();

        if (!items.length) {
            statusEl.textContent = 'Không có sự kiện nào khớp từ khóa.';
            listEl.replaceChildren();
            return;
        }

        statusEl.textContent = `Tìm thấy ${items.length} sự kiện`;
        renderEvents(items);
    } catch (err) {
        console.error('Lỗi khi tải sự kiện:', err);
        statusEl.textContent = 'Không tải được dữ liệu, vui lòng thử lại.';
        listEl.replaceChildren();
    }
};

// Xử lý khi bấm nút "Tìm"
byId('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    loadEvents(byId('keyword').value);
});

// Tải danh sách khi mở trang
loadEvents();
