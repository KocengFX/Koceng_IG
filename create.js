const { createCanvas } = require('canvas');
const fs = require('fs');
const { DateTime } = require('luxon'); // Untuk menangani tanggal dengan mudah

// Ukuran canvas
const width = 1080;
const height = 1080;

// Membaca isi file text.txt
const quoteText = fs.readFileSync('text.txt', 'utf8');

// Membagi konten file menjadi baris-baris dan memfilter baris kosong
const quoteLines = quoteText.split('\n').filter(line => line.trim() !== '');

// Membaca daftar teks yang sudah digunakan dari file "used_quotes.json"
let usedQuotes = [];
const usedQuotesPath = 'used_quotes.json';
if (fs.existsSync(usedQuotesPath)) {
  usedQuotes = JSON.parse(fs.readFileSync(usedQuotesPath, 'utf8'));
}

// Menyaring teks yang belum digunakan
const unusedQuotes = quoteLines.filter(line => !usedQuotes.includes(line));

if (unusedQuotes.length === 0) {
  console.error('Semua teks sudah digunakan. Reset daftar atau tambahkan teks baru.');
  process.exit(1);
}

// Memilih teks secara acak dari daftar yang belum digunakan
const randomQuote = unusedQuotes[Math.floor(Math.random() * unusedQuotes.length)];

// Menyimpan teks yang sudah digunakan
usedQuotes.push(randomQuote);
fs.writeFileSync(usedQuotesPath, JSON.stringify(usedQuotes, null, 2));

// Memisahkan kutipan dan penulis jika formatnya "kutipan - penulis"
const [quote, author] = randomQuote.split(' - ');

// Membuat canvas
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Latar belakang putih
ctx.fillStyle = '#ffffff'; // Warna latar belakang putih
ctx.fillRect(0, 0, width, height);

// Menambahkan "title bar" khas MacBook dengan warna abu-abu terang
ctx.fillStyle = '#f2f2f2'; // Warna bar judul abu terang
ctx.fillRect(0, 0, width, 40);

// Menambahkan nama aplikasi di bar judul
ctx.font = '15px Consolas';
ctx.fillStyle = '#555555'; // Warna teks abu-abu gelap
ctx.fillText('Koceng.js', width / 2 - ctx.measureText('Koceng.js').width / 2, 27);


// Tombol dengan warna asli (untuk menjaga estetika MacBook)
const buttonRadius = 10; // Ukuran radius tombol lebih besar
ctx.fillStyle = '#ff5f57'; // Tombol merah
ctx.beginPath();
ctx.arc(25, 20, buttonRadius, 0, Math.PI * 2);
ctx.fill();

ctx.fillStyle = '#ffbd2e'; // Tombol kuning
ctx.beginPath();
ctx.arc(55, 20, buttonRadius, 0, Math.PI * 2);
ctx.fill();

ctx.fillStyle = '#28c840'; // Tombol hijau
ctx.beginPath();
ctx.arc(85, 20, buttonRadius, 0, Math.PI * 2);
ctx.fill();

// Fungsi untuk membungkus teks agar tidak melebihi lebar tertentu
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth > maxWidth) {
      ctx.fillText(line.trim(), x, y); // Tampilkan teks dalam satu baris
      line = words[i] + ' '; // Mulai baris baru
      y += lineHeight; // Pindah ke baris berikutnya
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line.trim(), x, y); // Tampilkan sisa teks
  return y + lineHeight; // Kembalikan posisi y setelah teks terakhir
}

// Menambahkan quote pada kanvas
ctx.font = '40px Consolas';
ctx.fillStyle = '#000000'; // Warna teks hitam

// Bungkus teks kutipan dan tampilkan
const maxWidth = 1000; // Maksimal lebar teks (sesuai ukuran kanvas)
const lineHeight = 50; // Jarak antar baris
let quoteY = 150; // Posisi awal teks pada sumbu y
quoteY = wrapText(ctx, quote, 40, quoteY, maxWidth, lineHeight);

// Menambahkan nama penulis di bawah kutipan (opsional jika ada)
if (author) {
  ctx.font = '15px Consolas';
  ctx.fillStyle = '#555555'; // Warna teks untuk penulis
  ctx.fillText(`- Koceng404`, 40, quoteY);
  quoteY += 30; // Menambah jarak setelah nama penulis
}

// Menghitung hari ke-berapa dalam tahun ini
const today = DateTime.now();
const startOfYear = DateTime.fromObject({ year: today.year, month: 1, day: 1 });
const daysInYear = startOfYear.isLeap ? 366 : 365; // Menghitung jumlah hari dalam tahun
const dayOfYear = Math.floor(today.diff(startOfYear, 'days').days) + 1; // Menggunakan Math.floor untuk memastikan hasilnya bulat

// Menambahkan informasi hari ke-berapa dalam tahun ini ke gambar (format 1/365)
ctx.font = '15px Consolas';
ctx.fillStyle = '#555555'; // Warna teks abu gelap

// Menempatkan "1/365" di tengah bawah
const text1 = `*${dayOfYear}/${daysInYear}*`;
const textWidth1 = ctx.measureText(text1).width;
ctx.fillText(text1, (width - textWidth1) / 2, height - 30);

// Menambahkan tanggal saat ini di pojok bawah kanan
ctx.font = '20px Consolas';
ctx.fillStyle = '#555555'; // Warna teks abu gelap
const dateText = today.toFormat('dd-LL-yyyy'); // Format tanggal
const textWidth2 = ctx.measureText(dateText).width;
ctx.fillText(dateText, width - textWidth2 - 30, height - 30);

// Menyimpan gambar sebagai file PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('motivational_quote_output_light_mode.png', buffer);

console.log(`Quote digunakan: "${randomQuote}"`);
