Mari fokus mengembangkan fitur dan halaman untuk admin/owner terlebih dahulu. Point pointnya adalah sebagai berikut:
1. Saya ingin owner/admin memiliki fitur-fitur berikut:
   a. CRUD Lapak dan detail-detailnya
   b. Invite via Kode/URL khusus, Kick, Approve Anggota
   c. Validasi setoran produk dari anggota
   d. Kelola produk
   e. CRUD postingan private di komunitas lapak, anggota hanya bisa melihat dan berkomentar tidak bisa membuat post di komunitas ini
   f. CRUD Pengumuman,notifikasi
   g. Laporan Harian, Mingguan, Bulanan termasuk data vizualisasi
2. Saya ingin halaman admin/owner menggunakan sidebar dengan fitur-fitur diatas.
3. Saya ingin project ini memiliki fitur foto profil, produk. yang bisa ditampilkan, dilihat, diganti.



======================================

Saya ingin build ulang/develop ulang project ini dengan mengerjakan berdasarkan phase/step secara urut. Jadi saya ingin kamu hapus semua file yang ada di project ini. kemudian install framework/library yang diperlukan terlebih dahulu. Setelah itu, mengerjakan fitur-fitur yang diperlukan satu per satu. saya ingin tetap menggunakan tech stack seperti sekarang SvelteKit, TailwindCSS, Shadcn-svelte, dan lain-lain. Yang penting framwork dan library dapat jalan dengan baik terlebih dahulu. Kemudian
kerjakan sesuai step berikut :
1. buat landing page project ini
2. Buat halaman register dan login, reset password/PIN.
3. buat sistem register, login, logout, reset password/PIN.
4. Pastikan sitem point 2 dan 3 dengan menggunakan role admin dan user. Admin merupakan pemilik lapak, user adalah anggota dari lapak.
5. Buat Panel Admin dan Panel User sebagai default page setelah berhasil login.
6. Semua halaman menggunakan tema berwarna biru, dan memiliki mode dark/light mode. Dan saya ingin semua halaman terlihat modern, profesional dan rapi.

Untuk sekarang buat seperti itu terlebih dahulu. next step kita diskusikan lagi.


Saat ini untuk fitur login, register, logout, reset PIN sudah ada. sekarang mari fokus ke fitur selanjutnya, yaitu fitur Buat Lapak untuk admin dan join lapak untuk user.
1. Admin dapat membuat lapak lebih dari satu. Admin juga bisa mengubah status lapak, misalnya lapak tutup, lapak buka, mengedit informasi lapak, ataupun menghapus lapak.
2. User dapat join lapak dengan invite kode ataupun url yang diberikan admin. User bebas join lapak mana saja asalkan memiliki invite kode ataupun url yang diberikan admin, tetapi tetap melalui proses filtering oleh admin artinya menunggu approval admin.
3. Admin berhak invite user, kick user, approve user.
4. Admin bisa mengubah status lapak, artinya lapak memiliki status public dan private. public artinya lapak bisa dilihat oleh siapa saja, termasuk oleh user yang belum join lapak. private artinya lapak tidak terlihat oleh user global(user yang belum join lapak).
5. saya ingin invite kode ataupun url invite user unique, artinya selalu berubah dan memiliki masa berlaku
Fokus utama kita sekarang adalah fitur diatas terlebih dahulu.


Beberapa perbaikan yang perlu dilakukan :
1. ketika lapak dengan status public, user yang request join akan diberikan form request join. user harus mengisi form tersebut. jika di ACC oleh admin maka otomatis user akan tergabung dalam lapak. Jadi jika lapak disetting public oleh admin, proses join memiliki 2 sistem, yaitu isi form atau jika memiliki invite kode tinggal masukkan invite kode. user akan diberikan 2 pilihan untuk join lapak public.
2. konfigurasi visibilitas lapak masih belum bisa diubah oleh admin. seperti pada gambar
3. Tambahkan pengaturan informasi tambahan terkait lapak, seperti nomor hp admin, alamat lapak, hari buka/tutup, jam buka/tutup, jumlah anggota.


1. isi form request join harusnya ditampilkan di panel admin, agar admin dapat membacanya dan memutuskan apakah ACC atau TIDAK ACC.
2. kemudian buat agar admin menyertakan alasan penolakan, jika tidak di acc. kemudian alasan tersebut juga ditampilkan pada user yang request join.



Sekarang saya ingin menambahkan fitur baru, yaitu notification. Notification ini akan berisi seluruh notifikasi dari fitur-fitur yang ada, misalnya notifikasi join lapak, notifikasi join lapak diterima/ditolak dan lain-lainnya. saya ingin notifikasi seperti pada notifikasi sistem lainnya, jadi notifikasi ada fitur baca selengkapnya/baca detail, notifikasi terdapat date dan time notifikasi, status dibaca/belum dibaca. nofitikasi ada baik di panel admin maupun di panel user, tetapi notifikasinya berbeda sesuai dengan fitur-yang digunakan.


Hal yang perlu diperbaiki :
1. Pada navbar panel admin, tidak ada icons notifikasi.. tetapi notifikasi ada di sidebar, jadi harus buka sidebar terlebih dahulu untuk melihat notifikasi. saya ingin pada navbar terdapat icons notifikasi, jika diklik akan membuka modal/dialog mengambang yang berisi daftar notifikasi yang ada. seperti pada tampilan notifikasi pada umumnya di aplikasi populer.


1. Pada dropdown  notifikasi, sertakan juga tanggal, dan jamnya, serta berikan juga fitur tandai semua notifikasi sebagai dibaca.
2. Saya lihat layout navbar, sidebar pada panel admin dan panel user berbeda. saya ingin hal ini dibuat saya. jadi perbarui panel user agar layoutnya sama dengan panel admin tetapi dengan fiturnya tetap menampilkan fitur untuk user saja.


Kembali ke fitur pengelolan lapak :
1. perhatikan pada gambar, terdapat kondisi dimana join ditolak. dan lapak masih muncul di menu lapak saya dengan notifikasi ditolak. seharusnya jika sudah ditolak jangan dimasukkan ke menu lapak saya. kembalikan ke menu lapak public(jika statusnya public) hilangkan jika statusnya private.
2. jika join ditolak, buat masa penolakan. artinya suatu saat user diperbolehkan request join lagi. misalnya setalah 7 hari user bisa request join lagi. atau user bisa langsung join jika mendapatkan url/invite kode dari admin langsung.
3. buat fitur keluar lapak. tetapi dengan from juga (tidak langsung keluar). buat form alasan keluar, kemudian jika sudah di setujui admin otomatis keluar lapak (tidak menjadi anggota lagi).


1. gambar 1 merupakan gambar pemberitahuan setalah request join ditolak, tidak muncul couldown waktu sisa untuk request join ulang
2. Pada panel admin, notifikasi request user keluar lapak tidak muncul. seharusnya notifikasi request keluar muncul, dan status anggota menjadi pending
3. ketika bilah notifikasi diklik, maka otomatis notifikasi sudah dibuka dan tandai sebagai telah dibaca. perhatikan gambar 2, jika notifikasi diklik pada bilah tertentu, misalnya pada urutan teratas, maka notifikasi teratas tandai sebagai terbaca. berikan efek hover, aktive dan nonaktif juga agar memudahkan user. terapkan pada kedua panel, admin dan user.