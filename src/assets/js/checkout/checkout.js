
document.addEventListener('DOMContentLoaded', () => {
  const radios = document.querySelectorAll('input[name="paymentMethod"]');
  const contents = document.querySelectorAll('.content');

  radios.forEach(radio => {
    radio.addEventListener('change', (event) => {
// Ẩn tất cả nội dung
      contents.forEach(content => content.style.display = 'none');

// Hiển thị nội dung tương ứng với radio được chọn
      const selectedContent = document.getElementById(`content-${event.target.value}`);
      if (selectedContent) {
        selectedContent.style.display = 'block';
      }
    });
  });
});

