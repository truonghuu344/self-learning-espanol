// Dữ liệu từ vựng: [tiếng Tây Ban Nha, tiếng Việt, câu ví dụ, nghĩa câu ví dụ]
window.TOPICS = [
  { id: "saludos", name: "Chào hỏi", level: "A1", icon: "👋", words: [
    ["hola", "xin chào", "¡Hola! ¿Qué tal?", "Chào! Dạo này thế nào?"],
    ["buenos días", "chào buổi sáng", "Buenos días, señora.", "Chào buổi sáng, thưa bà."],
    ["buenas tardes", "chào buổi chiều", "Buenas tardes a todos.", "Chào buổi chiều mọi người."],
    ["buenas noches", "chào buổi tối / chúc ngủ ngon", "Buenas noches, mamá.", "Chúc mẹ ngủ ngon."],
    ["adiós", "tạm biệt", "Adiós, hasta mañana.", "Tạm biệt, mai gặp."],
    ["hasta luego", "hẹn gặp lại", "¡Hasta luego, amigo!", "Hẹn gặp lại nhé bạn!"],
    ["por favor", "làm ơn", "Un café, por favor.", "Cho một cà phê, làm ơn."],
    ["gracias", "cảm ơn", "Muchas gracias.", "Cảm ơn rất nhiều."],
    ["de nada", "không có gì", "—Gracias. —De nada.", "—Cảm ơn. —Không có gì."],
    ["lo siento", "tôi xin lỗi", "Lo siento mucho.", "Tôi rất xin lỗi."],
    ["perdón", "xin lỗi (cho hỏi)", "Perdón, ¿dónde está la estación?", "Xin lỗi, nhà ga ở đâu?"],
    ["¿cómo estás?", "bạn khỏe không?", "Hola, Ana, ¿cómo estás?", "Chào Ana, bạn khỏe không?"],
    ["me llamo", "tôi tên là", "Me llamo Trường.", "Tôi tên là Trường."],
    ["mucho gusto", "rất vui được gặp", "Mucho gusto, Carlos.", "Rất vui được gặp anh, Carlos."]
  ]},
  { id: "numeros", name: "Số đếm", level: "A1", icon: "🔢", words: [
    ["uno", "một", "Tengo un hermano.", "Tôi có một anh trai."],
    ["dos", "hai", "Dos cafés, por favor.", "Hai cà phê, làm ơn."],
    ["tres", "ba", "Son las tres.", "Bây giờ là ba giờ."],
    ["cuatro", "bốn", "Somos cuatro.", "Chúng tôi có bốn người."],
    ["cinco", "năm", "Cuesta cinco euros.", "Giá năm euro."],
    ["seis", "sáu", "Trabajo seis días.", "Tôi làm sáu ngày."],
    ["siete", "bảy", "Mi hija tiene siete años.", "Con gái tôi bảy tuổi."],
    ["ocho", "tám", "Desayuno a las ocho.", "Tôi ăn sáng lúc tám giờ."],
    ["nueve", "chín", "Hay nueve sillas.", "Có chín cái ghế."],
    ["diez", "mười", "Espera diez minutos.", "Đợi mười phút."],
    ["veinte", "hai mươi", "Tengo veinte años.", "Tôi hai mươi tuổi."],
    ["cien", "một trăm", "Cien por cien.", "Một trăm phần trăm."],
    ["mil", "một nghìn", "Mil gracias.", "Cảm ơn ngàn lần."]
  ]},
  { id: "colores", name: "Màu sắc", level: "A1", icon: "🎨", words: [
    ["rojo", "màu đỏ", "El coche es rojo.", "Chiếc xe màu đỏ."],
    ["azul", "màu xanh dương", "El cielo es azul.", "Bầu trời màu xanh."],
    ["verde", "màu xanh lá", "La hierba es verde.", "Cỏ màu xanh lá."],
    ["amarillo", "màu vàng", "El sol es amarillo.", "Mặt trời màu vàng."],
    ["negro", "màu đen", "Tengo un gato negro.", "Tôi có một con mèo đen."],
    ["blanco", "màu trắng", "La nieve es blanca.", "Tuyết màu trắng."],
    ["naranja", "màu cam", "Una camiseta naranja.", "Một chiếc áo phông màu cam."],
    ["morado", "màu tím", "Me gustan las flores moradas.", "Tôi thích hoa màu tím."],
    ["rosa", "màu hồng", "Un vestido rosa.", "Một chiếc váy hồng."],
    ["gris", "màu xám", "Hoy es un día gris.", "Hôm nay là một ngày u ám."],
    ["marrón", "màu nâu", "Tiene los ojos marrones.", "Cô ấy có đôi mắt nâu."]
  ]},
  { id: "familia", name: "Gia đình", level: "A1", icon: "👨‍👩‍👧", words: [
    ["la madre", "mẹ", "Mi madre es profesora.", "Mẹ tôi là giáo viên."],
    ["el padre", "bố", "Mi padre trabaja mucho.", "Bố tôi làm việc nhiều."],
    ["el hermano", "anh / em trai", "Mi hermano es alto.", "Anh trai tôi cao."],
    ["la hermana", "chị / em gái", "Mi hermana estudia medicina.", "Chị tôi học y."],
    ["el hijo", "con trai", "Tienen un hijo.", "Họ có một con trai."],
    ["la hija", "con gái", "Su hija es pequeña.", "Con gái anh ấy còn nhỏ."],
    ["el abuelo", "ông", "Mi abuelo tiene ochenta años.", "Ông tôi tám mươi tuổi."],
    ["la abuela", "bà", "La abuela cocina muy bien.", "Bà nấu ăn rất ngon."],
    ["el tío", "chú / bác / cậu", "Mi tío vive en Madrid.", "Chú tôi sống ở Madrid."],
    ["la tía", "cô / dì", "Mi tía es muy simpática.", "Dì tôi rất dễ mến."],
    ["el primo", "anh / em họ", "Mi primo juega al fútbol.", "Em họ tôi chơi bóng đá."],
    ["el esposo", "chồng", "Su esposo es médico.", "Chồng cô ấy là bác sĩ."],
    ["la esposa", "vợ", "Mi esposa habla francés.", "Vợ tôi nói tiếng Pháp."]
  ]},
  { id: "comida", name: "Đồ ăn & uống", level: "A1", icon: "🥘", words: [
    ["el agua", "nước", "Un vaso de agua, por favor.", "Cho một cốc nước, làm ơn."],
    ["el pan", "bánh mì", "Compro pan todos los días.", "Tôi mua bánh mì mỗi ngày."],
    ["el café", "cà phê", "Me gusta el café solo.", "Tôi thích cà phê đen."],
    ["la leche", "sữa", "Un café con leche.", "Một cà phê sữa."],
    ["el arroz", "cơm / gạo", "Arroz con pollo.", "Cơm gà."],
    ["el pollo", "thịt gà", "El pollo está muy rico.", "Thịt gà rất ngon."],
    ["la carne", "thịt", "No como carne.", "Tôi không ăn thịt."],
    ["el pescado", "cá (món ăn)", "Pescado a la plancha.", "Cá áp chảo."],
    ["la fruta", "trái cây", "Como fruta cada día.", "Tôi ăn trái cây mỗi ngày."],
    ["la manzana", "quả táo", "Una manzana roja.", "Một quả táo đỏ."],
    ["el queso", "phô mai", "Me encanta el queso.", "Tôi rất thích phô mai."],
    ["el desayuno", "bữa sáng", "El desayuno es a las ocho.", "Bữa sáng lúc tám giờ."],
    ["la comida", "bữa trưa / đồ ăn", "La comida está lista.", "Đồ ăn đã sẵn sàng."],
    ["la cena", "bữa tối", "¿Qué hay para cenar?", "Tối nay ăn gì?"]
  ]},
  { id: "verbos", name: "Động từ cơ bản", level: "A1", icon: "🏃", words: [
    ["ser", "là (bản chất)", "Soy estudiante.", "Tôi là sinh viên."],
    ["estar", "là / ở (trạng thái)", "Estoy cansado.", "Tôi đang mệt."],
    ["tener", "có", "Tengo hambre.", "Tôi đói."],
    ["hacer", "làm", "¿Qué haces?", "Bạn đang làm gì?"],
    ["ir", "đi", "Voy a la playa.", "Tôi đi biển."],
    ["comer", "ăn", "Comemos juntos.", "Chúng ta ăn cùng nhau."],
    ["beber", "uống", "Bebo mucha agua.", "Tôi uống nhiều nước."],
    ["hablar", "nói", "Hablo un poco de español.", "Tôi nói một chút tiếng Tây Ban Nha."],
    ["vivir", "sống", "Vivo en Hanói.", "Tôi sống ở Hà Nội."],
    ["querer", "muốn / yêu", "Quiero un helado.", "Tôi muốn một cây kem."],
    ["poder", "có thể", "¿Puedo pasar?", "Tôi vào được không?"],
    ["trabajar", "làm việc", "Trabajo desde casa.", "Tôi làm việc ở nhà."],
    ["estudiar", "học", "Estudio español.", "Tôi học tiếng Tây Ban Nha."],
    ["dormir", "ngủ", "Duermo ocho horas.", "Tôi ngủ tám tiếng."],
    ["saber", "biết (kiến thức)", "No sé la respuesta.", "Tôi không biết câu trả lời."]
  ]},
  { id: "adjetivos", name: "Tính từ", level: "A1", icon: "✨", words: [
    ["grande", "to, lớn", "Una casa grande.", "Một ngôi nhà lớn."],
    ["pequeño", "nhỏ", "Un perro pequeño.", "Một con chó nhỏ."],
    ["bueno", "tốt", "Es una buena idea.", "Đó là một ý hay."],
    ["malo", "xấu, tệ", "Hace mal tiempo.", "Thời tiết xấu."],
    ["bonito", "đẹp", "¡Qué bonito!", "Đẹp quá!"],
    ["nuevo", "mới", "Tengo un móvil nuevo.", "Tôi có điện thoại mới."],
    ["viejo", "cũ, già", "Un libro viejo.", "Một cuốn sách cũ."],
    ["caro", "đắt", "Es muy caro.", "Cái này đắt quá."],
    ["barato", "rẻ", "Este hotel es barato.", "Khách sạn này rẻ."],
    ["fácil", "dễ", "El español es fácil.", "Tiếng Tây Ban Nha dễ."],
    ["difícil", "khó", "El examen fue difícil.", "Bài thi khó."],
    ["feliz", "hạnh phúc", "Estoy muy feliz.", "Tôi rất hạnh phúc."],
    ["cansado", "mệt", "Estamos cansados.", "Chúng tôi mệt."]
  ]},
  { id: "tiempo", name: "Thời gian", level: "A1", icon: "📅", words: [
    ["hoy", "hôm nay", "Hoy hace calor.", "Hôm nay trời nóng."],
    ["mañana", "ngày mai", "Mañana voy a Madrid.", "Mai tôi đi Madrid."],
    ["ayer", "hôm qua", "Ayer llovió mucho.", "Hôm qua mưa nhiều."],
    ["lunes", "thứ Hai", "El lunes trabajo.", "Thứ Hai tôi làm việc."],
    ["martes", "thứ Ba", "Nos vemos el martes.", "Gặp nhau thứ Ba nhé."],
    ["miércoles", "thứ Tư", "El miércoles estudio.", "Thứ Tư tôi học."],
    ["jueves", "thứ Năm", "El jueves hay una fiesta.", "Thứ Năm có tiệc."],
    ["viernes", "thứ Sáu", "¡Por fin es viernes!", "Cuối cùng cũng thứ Sáu!"],
    ["sábado", "thứ Bảy", "El sábado descanso.", "Thứ Bảy tôi nghỉ."],
    ["domingo", "Chủ nhật", "El domingo como con mi familia.", "Chủ nhật tôi ăn cùng gia đình."],
    ["la semana", "tuần", "Una semana de vacaciones.", "Một tuần nghỉ."],
    ["el mes", "tháng", "El mes que viene.", "Tháng sau."],
    ["el año", "năm", "¡Feliz año nuevo!", "Chúc mừng năm mới!"]
  ]},
  { id: "casa", name: "Nhà cửa", level: "A1", icon: "🏠", words: [
    ["la casa", "ngôi nhà", "Mi casa es tu casa.", "Nhà tôi là nhà bạn."],
    ["el piso", "căn hộ", "Vivo en un piso pequeño.", "Tôi sống trong một căn hộ nhỏ."],
    ["la cocina", "nhà bếp", "Estoy en la cocina.", "Tôi đang ở trong bếp."],
    ["el baño", "phòng tắm", "¿Dónde está el baño?", "Phòng tắm ở đâu?"],
    ["el dormitorio", "phòng ngủ", "El dormitorio es grande.", "Phòng ngủ rộng."],
    ["la mesa", "cái bàn", "Las llaves están en la mesa.", "Chìa khóa ở trên bàn."],
    ["la silla", "cái ghế", "Siéntate en la silla.", "Ngồi xuống ghế đi."],
    ["la cama", "cái giường", "Me voy a la cama.", "Tôi đi ngủ đây."],
    ["la puerta", "cửa ra vào", "Cierra la puerta, por favor.", "Làm ơn đóng cửa."],
    ["la ventana", "cửa sổ", "Abre la ventana.", "Mở cửa sổ ra."],
    ["la llave", "chìa khóa", "No encuentro la llave.", "Tôi không tìm thấy chìa khóa."]
  ]},
  { id: "cuerpo", name: "Cơ thể", level: "A1", icon: "🧍", words: [
    ["la cabeza", "đầu", "Me duele la cabeza.", "Tôi đau đầu."],
    ["el ojo", "mắt", "Tiene los ojos azules.", "Anh ấy có mắt xanh."],
    ["la boca", "miệng", "Abre la boca.", "Há miệng ra."],
    ["la nariz", "mũi", "Tengo la nariz roja.", "Mũi tôi bị đỏ."],
    ["la oreja", "tai", "Me duele la oreja.", "Tôi đau tai."],
    ["la mano", "bàn tay", "Lávate las manos.", "Rửa tay đi."],
    ["el brazo", "cánh tay", "Me rompí el brazo.", "Tôi bị gãy tay."],
    ["la pierna", "chân (cẳng)", "Tiene las piernas largas.", "Cô ấy có đôi chân dài."],
    ["el pie", "bàn chân", "Voy a pie.", "Tôi đi bộ."],
    ["el estómago", "dạ dày, bụng", "Me duele el estómago.", "Tôi đau bụng."]
  ]},
  { id: "viajes", name: "Du lịch", level: "A2", icon: "✈️", words: [
    ["el aeropuerto", "sân bay", "Vamos al aeropuerto.", "Chúng ta ra sân bay."],
    ["el billete", "vé", "Un billete de ida y vuelta.", "Một vé khứ hồi."],
    ["el pasaporte", "hộ chiếu", "Su pasaporte, por favor.", "Cho xem hộ chiếu của anh."],
    ["la maleta", "va li", "Mi maleta es azul.", "Va li của tôi màu xanh."],
    ["el hotel", "khách sạn", "El hotel está cerca.", "Khách sạn ở gần đây."],
    ["la habitación", "phòng", "Una habitación doble.", "Một phòng đôi."],
    ["la estación", "nhà ga", "La estación de tren.", "Ga tàu hỏa."],
    ["la playa", "bãi biển", "Vamos a la playa.", "Chúng ta đi biển."],
    ["el mapa", "bản đồ", "¿Tienes un mapa?", "Bạn có bản đồ không?"],
    ["a la derecha", "bên phải", "Gire a la derecha.", "Rẽ phải."],
    ["a la izquierda", "bên trái", "Está a la izquierda.", "Nó ở bên trái."],
    ["todo recto", "đi thẳng", "Siga todo recto.", "Cứ đi thẳng."],
    ["cerca", "gần", "¿Está cerca?", "Có gần không?"],
    ["lejos", "xa", "Está muy lejos.", "Xa lắm."]
  ]},
  { id: "clima", name: "Thời tiết", level: "A2", icon: "🌦️", words: [
    ["hace calor", "trời nóng", "En agosto hace calor.", "Tháng Tám trời nóng."],
    ["hace frío", "trời lạnh", "Hoy hace mucho frío.", "Hôm nay rất lạnh."],
    ["hace sol", "trời nắng", "Hace sol, vamos fuera.", "Trời nắng, ra ngoài thôi."],
    ["hace viento", "có gió", "Hace viento en la costa.", "Ở bờ biển có gió."],
    ["llueve", "trời mưa", "Llueve mucho en Hanói.", "Hà Nội mưa nhiều."],
    ["nieva", "có tuyết", "En invierno nieva.", "Mùa đông có tuyết."],
    ["la primavera", "mùa xuân", "Me encanta la primavera.", "Tôi rất thích mùa xuân."],
    ["el verano", "mùa hè", "En verano voy a la playa.", "Mùa hè tôi đi biển."],
    ["el otoño", "mùa thu", "El otoño es bonito.", "Mùa thu đẹp."],
    ["el invierno", "mùa đông", "El invierno es largo.", "Mùa đông dài."]
  ]},
  { id: "emociones", name: "Cảm xúc", level: "A2", icon: "💭", words: [
    ["contento", "vui vẻ", "Estoy contento hoy.", "Hôm nay tôi vui."],
    ["triste", "buồn", "¿Por qué estás triste?", "Sao bạn buồn?"],
    ["enfadado", "tức giận", "Mi jefe está enfadado.", "Sếp tôi đang giận."],
    ["nervioso", "lo lắng, hồi hộp", "Estoy nervioso por el examen.", "Tôi hồi hộp vì kỳ thi."],
    ["tranquilo", "bình tĩnh", "Tranquilo, todo está bien.", "Bình tĩnh, mọi thứ ổn."],
    ["aburrido", "chán", "Estoy aburrido.", "Tôi chán quá."],
    ["sorprendido", "ngạc nhiên", "Estoy muy sorprendido.", "Tôi rất ngạc nhiên."],
    ["tener miedo", "sợ", "Tengo miedo de los perros.", "Tôi sợ chó."],
    ["echar de menos", "nhớ (ai đó)", "Te echo de menos.", "Anh nhớ em."]
  ]},
  { id: "frases", name: "Câu giao tiếp", level: "A1", icon: "💬", words: [
    ["¿Hablas inglés?", "Bạn nói tiếng Anh không?", "", ""],
    ["No entiendo", "Tôi không hiểu", "", ""],
    ["¿Cuánto cuesta?", "Cái này giá bao nhiêu?", "", ""],
    ["¿Dónde está el baño?", "Nhà vệ sinh ở đâu?", "", ""],
    ["La cuenta, por favor", "Làm ơn tính tiền", "", ""],
    ["Más despacio, por favor", "Làm ơn nói chậm hơn", "", ""],
    ["¿Qué hora es?", "Mấy giờ rồi?", "", ""],
    ["Me gusta mucho", "Tôi rất thích", "", ""],
    ["Soy de Vietnam", "Tôi đến từ Việt Nam", "", ""],
    ["¿Cómo se dice...?", "... nói thế nào?", "", ""],
    ["Necesito ayuda", "Tôi cần giúp đỡ", "", ""],
    ["¿Puede repetir?", "Ông/bà nhắc lại được không?", "", ""],
    ["Quisiera...", "Tôi muốn... (lịch sự)", "", ""],
    ["¡Qué aproveche!", "Chúc ngon miệng!", "", ""]
  ]}
];

window.GRAMMAR = [
  { id: "pronunciacion", title: "Phát âm cơ bản", level: "A1", html: `
    <p>Tiếng Tây Ban Nha gần như <strong>viết sao đọc vậy</strong>. Chỉ cần nhớ một số chữ đặc biệt:</p>
    <table><thead><tr><th>Chữ</th><th>Cách đọc</th><th>Ví dụ</th></tr></thead><tbody>
    <tr><td>j, g (trước e/i)</td><td>"h" bật mạnh từ cổ họng</td><td><span class="say">jamón</span>, <span class="say">gente</span></td></tr>
    <tr><td>h</td><td>câm, không đọc</td><td><span class="say">hola</span>, <span class="say">hora</span></td></tr>
    <tr><td>ñ</td><td>"nh"</td><td><span class="say">España</span>, <span class="say">mañana</span></td></tr>
    <tr><td>ll, y</td><td>gần "d" / "j" nhẹ</td><td><span class="say">llamar</span>, <span class="say">yo</span></td></tr>
    <tr><td>rr</td><td>"r" rung mạnh</td><td><span class="say">perro</span>, <span class="say">carro</span></td></tr>
    <tr><td>z, c (trước e/i)</td><td>"th" (Tây Ban Nha) / "x" (Mỹ Latinh)</td><td><span class="say">zapato</span>, <span class="say">cine</span></td></tr>
    <tr><td>v</td><td>gần như "b"</td><td><span class="say">vino</span>, <span class="say">vivir</span></td></tr>
    </tbody></table>
    <div class="callout">Dấu sắc (á, é, í, ó, ú) đánh dấu âm tiết được nhấn: <span class="say">café</span>, <span class="say">música</span>.</div>` },
  { id: "pronombres", title: "Đại từ nhân xưng", level: "A1", html: `
    <table><thead><tr><th>Tây Ban Nha</th><th>Tiếng Việt</th></tr></thead><tbody>
    <tr><td><span class="say">yo</span></td><td>tôi</td></tr>
    <tr><td><span class="say">tú</span></td><td>bạn (thân mật)</td></tr>
    <tr><td><span class="say">él / ella / usted</span></td><td>anh ấy / cô ấy / ông, bà (lịch sự)</td></tr>
    <tr><td><span class="say">nosotros / nosotras</span></td><td>chúng tôi</td></tr>
    <tr><td><span class="say">vosotros / vosotras</span></td><td>các bạn (chỉ dùng ở Tây Ban Nha)</td></tr>
    <tr><td><span class="say">ellos / ellas / ustedes</span></td><td>họ / quý vị</td></tr>
    </tbody></table>
    <div class="callout">Người bản xứ thường <strong>bỏ đại từ</strong> vì đuôi động từ đã cho biết chủ ngữ: <span class="say">Hablo español</span> = Tôi nói tiếng Tây Ban Nha.</div>` },
  { id: "articulos", title: "Giống & mạo từ", level: "A1", html: `
    <p>Danh từ có giống <strong>đực</strong> (thường kết thúc bằng -o) hoặc <strong>cái</strong> (thường kết thúc bằng -a).</p>
    <table><thead><tr><th></th><th>Xác định</th><th>Không xác định</th></tr></thead><tbody>
    <tr><td>Đực, số ít</td><td><span class="say">el libro</span></td><td><span class="say">un libro</span></td></tr>
    <tr><td>Cái, số ít</td><td><span class="say">la casa</span></td><td><span class="say">una casa</span></td></tr>
    <tr><td>Đực, số nhiều</td><td><span class="say">los libros</span></td><td><span class="say">unos libros</span></td></tr>
    <tr><td>Cái, số nhiều</td><td><span class="say">las casas</span></td><td><span class="say">unas casas</span></td></tr>
    </tbody></table>
    <div class="callout">Ngoại lệ hay gặp: <span class="say">el día</span>, <span class="say">el problema</span>, <span class="say">la mano</span>. Tính từ đổi theo danh từ: <span class="say">el coche rojo</span> / <span class="say">la casa roja</span>.</div>` },
  { id: "presente", title: "Chia động từ thì hiện tại", level: "A1", html: `
    <p>Động từ có ba nhóm đuôi: <strong>-ar</strong>, <strong>-er</strong>, <strong>-ir</strong>. Bỏ đuôi gốc rồi thêm đuôi theo chủ ngữ:</p>
    <table><thead><tr><th></th><th>hablar (nói)</th><th>comer (ăn)</th><th>vivir (sống)</th></tr></thead><tbody>
    <tr><td>yo</td><td><span class="say">hablo</span></td><td><span class="say">como</span></td><td><span class="say">vivo</span></td></tr>
    <tr><td>tú</td><td><span class="say">hablas</span></td><td><span class="say">comes</span></td><td><span class="say">vives</span></td></tr>
    <tr><td>él / ella</td><td><span class="say">habla</span></td><td><span class="say">come</span></td><td><span class="say">vive</span></td></tr>
    <tr><td>nosotros</td><td><span class="say">hablamos</span></td><td><span class="say">comemos</span></td><td><span class="say">vivimos</span></td></tr>
    <tr><td>vosotros</td><td><span class="say">habláis</span></td><td><span class="say">coméis</span></td><td><span class="say">vivís</span></td></tr>
    <tr><td>ellos</td><td><span class="say">hablan</span></td><td><span class="say">comen</span></td><td><span class="say">viven</span></td></tr>
    </tbody></table>` },
  { id: "ser-estar", title: "Ser và Estar", level: "A1", html: `
    <p>Cả hai đều nghĩa là "là". <strong>Ser</strong> dùng cho bản chất lâu dài (nghề nghiệp, quốc tịch, tính cách). <strong>Estar</strong> dùng cho trạng thái tạm thời và vị trí.</p>
    <table><thead><tr><th></th><th>ser</th><th>estar</th></tr></thead><tbody>
    <tr><td>yo</td><td><span class="say">soy</span></td><td><span class="say">estoy</span></td></tr>
    <tr><td>tú</td><td><span class="say">eres</span></td><td><span class="say">estás</span></td></tr>
    <tr><td>él / ella</td><td><span class="say">es</span></td><td><span class="say">está</span></td></tr>
    <tr><td>nosotros</td><td><span class="say">somos</span></td><td><span class="say">estamos</span></td></tr>
    <tr><td>vosotros</td><td><span class="say">sois</span></td><td><span class="say">estáis</span></td></tr>
    <tr><td>ellos</td><td><span class="say">son</span></td><td><span class="say">están</span></td></tr>
    </tbody></table>
    <div class="callout"><span class="say">Soy vietnamita</span> (tôi là người Việt) · <span class="say">Estoy cansado</span> (tôi đang mệt) · <span class="say">Madrid está en España</span> (Madrid ở Tây Ban Nha).</div>` },
  { id: "preguntas", title: "Câu hỏi & phủ định", level: "A1", html: `
    <p>Phủ định: đặt <strong>no</strong> trước động từ — <span class="say">No hablo francés</span>.</p>
    <p>Câu hỏi có dấu <strong>¿ ?</strong> ở cả đầu và cuối câu. Từ để hỏi luôn mang dấu sắc:</p>
    <table><thead><tr><th>Từ để hỏi</th><th>Nghĩa</th></tr></thead><tbody>
    <tr><td><span class="say">¿qué?</span></td><td>cái gì</td></tr><tr><td><span class="say">¿quién?</span></td><td>ai</td></tr>
    <tr><td><span class="say">¿dónde?</span></td><td>ở đâu</td></tr><tr><td><span class="say">¿cuándo?</span></td><td>khi nào</td></tr>
    <tr><td><span class="say">¿por qué?</span></td><td>tại sao</td></tr><tr><td><span class="say">¿cómo?</span></td><td>như thế nào</td></tr>
    <tr><td><span class="say">¿cuánto?</span></td><td>bao nhiêu</td></tr>
    </tbody></table>` },
  { id: "gustar", title: "Động từ gustar (thích)", level: "A2", html: `
    <p><strong>Gustar</strong> hoạt động ngược với tiếng Việt: vật được thích là chủ ngữ. Dùng <strong>gusta</strong> với danh từ số ít / động từ, <strong>gustan</strong> với danh từ số nhiều.</p>
    <table><thead><tr><th>Ai thích</th><th>Ví dụ</th><th>Nghĩa</th></tr></thead><tbody>
    <tr><td>me</td><td><span class="say">Me gusta el café</span></td><td>Tôi thích cà phê</td></tr>
    <tr><td>te</td><td><span class="say">¿Te gustan los perros?</span></td><td>Bạn thích chó không?</td></tr>
    <tr><td>le</td><td><span class="say">Le gusta bailar</span></td><td>Cô ấy thích nhảy</td></tr>
    <tr><td>nos</td><td><span class="say">Nos gusta viajar</span></td><td>Chúng tôi thích du lịch</td></tr>
    <tr><td>les</td><td><span class="say">Les gustan las películas</span></td><td>Họ thích phim</td></tr>
    </tbody></table>` },
  { id: "futuro", title: "Tương lai gần: ir a + động từ", level: "A2", html: `
    <p>Cách nói tương lai đơn giản nhất: <strong>ir</strong> (chia theo chủ ngữ) + <strong>a</strong> + động từ nguyên mẫu.</p>
    <table><thead><tr><th></th><th>ir</th><th>Ví dụ</th></tr></thead><tbody>
    <tr><td>yo</td><td>voy</td><td><span class="say">Voy a estudiar</span> — Tôi sẽ học</td></tr>
    <tr><td>tú</td><td>vas</td><td><span class="say">¿Vas a venir?</span> — Bạn sẽ đến chứ?</td></tr>
    <tr><td>él / ella</td><td>va</td><td><span class="say">Va a llover</span> — Trời sắp mưa</td></tr>
    <tr><td>nosotros</td><td>vamos</td><td><span class="say">Vamos a comer</span> — Chúng ta sẽ ăn</td></tr>
    <tr><td>ellos</td><td>van</td><td><span class="say">Van a viajar</span> — Họ sẽ đi du lịch</td></tr>
    </tbody></table>` }
];

// Lộ trình học: mỗi chặng gồm các bài (t = chủ đề từ vựng, g = bài ngữ pháp)
window.PATH = [
  { title: "Khởi động", level: "A1", desc: "Làm quen âm thanh và những câu chào đầu tiên.", units: [
    ["g", "pronunciacion"], ["t", "saludos"], ["g", "pronombres"], ["t", "numeros"] ] },
  { title: "Nền tảng", level: "A1", desc: "Danh từ, giống, tính từ và hai động từ quan trọng nhất.", units: [
    ["g", "articulos"], ["t", "familia"], ["t", "colores"], ["g", "ser-estar"], ["t", "adjetivos"] ] },
  { title: "Cuộc sống hằng ngày", level: "A1", desc: "Chia động từ và nói về sinh hoạt thường ngày.", units: [
    ["g", "presente"], ["t", "verbos"], ["t", "comida"], ["t", "tiempo"], ["t", "casa"], ["g", "preguntas"] ] },
  { title: "Giao tiếp", level: "A2", desc: "Diễn đạt sở thích, cảm xúc và những câu dùng mỗi ngày.", units: [
    ["t", "frases"], ["t", "cuerpo"], ["g", "gustar"], ["t", "emociones"] ] },
  { title: "Ra thế giới", level: "A2", desc: "Sẵn sàng cho chuyến đi đầu tiên tới nơi nói tiếng Tây Ban Nha.", units: [
    ["t", "clima"], ["t", "viajes"], ["g", "futuro"] ] }
];

// Mẹo & kinh nghiệm học
window.TIPS = [
  { cat: "Phương pháp", icon: "🧠", title: "Học ít nhưng đều", body: "15 phút mỗi ngày hiệu quả hơn 2 tiếng mỗi cuối tuần. Bộ não ghi nhớ tốt nhất khi được nhắc lại nhiều lần, cách quãng." },
  { cat: "Phương pháp", icon: "🔁", title: "Tin vào lịch ôn tập", body: "Phần Ôn tập dùng lặp lại ngắt quãng: hãy ôn hết các thẻ đến hạn trước khi học từ mới. Đừng cố học quá 10–20 từ mới mỗi ngày." },
  { cat: "Phương pháp", icon: "✍️", title: "Thành thật khi tự chấm", body: "Nếu phải nghĩ quá 3 giây mới nhớ, hãy bấm \"Khó\". Chấm dễ dãi làm thẻ biến mất quá lâu và bạn sẽ quên." },
  { cat: "Phương pháp", icon: "📦", title: "Học cả cụm, không học từ rời", body: "Học \"tengo hambre\" (tôi đói) thay vì chỉ \"hambre\". Cụm từ giúp bạn nói được ngay và nhớ luôn ngữ pháp." },
  { cat: "Phương pháp", icon: "🗣️", title: "Nói to khi học", body: "Đọc to mỗi từ sau khi nghe. Việc dùng miệng tạo thêm một đường ghi nhớ và giúp bạn quen cơ miệng phát âm." },
  { cat: "Phát âm", icon: "👄", title: "Năm nguyên âm luôn cố định", body: "a, e, i, o, u luôn đọc giống nhau dù ở vị trí nào — gần giống tiếng Việt. Đây là lợi thế lớn của người Việt." },
  { cat: "Phát âm", icon: "🌀", title: "Luyện âm R rung", body: "Đặt đầu lưỡi sau răng cửa trên, thổi hơi để lưỡi rung — như tiếng động cơ \"drrr\". Tập với perro, carro, rápido mỗi ngày vài phút." },
  { cat: "Phát âm", icon: "🎯", title: "Chú ý trọng âm", body: "Từ kết thúc bằng nguyên âm, n, s: nhấn âm tiết áp chót (casa, hablan). Còn lại nhấn âm cuối (hablar, ciudad). Dấu sắc là ngoại lệ, luôn nhấn chỗ có dấu." },
  { cat: "Phát âm", icon: "🔇", title: "Chữ H luôn câm", body: "hola đọc là \"ô-la\", hotel là \"ô-tel\". Đừng bật âm h như tiếng Anh." },
  { cat: "Ngữ pháp", icon: "⚖️", title: "Ser hay Estar?", body: "Mẹo DOCTOR / PLACE: Ser cho mô tả, nghề nghiệp, tính cách, thời gian, nguồn gốc, quan hệ. Estar cho vị trí, cảm xúc, hành động đang diễn ra, trạng thái." },
  { cat: "Ngữ pháp", icon: "🧩", title: "Học động từ theo mẫu", body: "Chỉ cần thuộc ba mẫu -ar, -er, -ir là chia được hàng trăm động từ có quy tắc. Học riêng các động từ bất quy tắc phổ biến: ser, estar, ir, tener, hacer." },
  { cat: "Ngữ pháp", icon: "🏷️", title: "Luôn học danh từ kèm mạo từ", body: "Học \"la mano\", \"el día\" chứ không chỉ \"mano\", \"día\". Như vậy bạn không bao giờ phải đoán giống của danh từ." },
  { cat: "Kinh nghiệm", icon: "🎬", title: "Xem phim có phụ đề tiếng Tây Ban Nha", body: "Khi đã có khoảng 300 từ, hãy xem phim, series bạn thích với phụ đề tiếng Tây Ban Nha (không phải tiếng Việt). Mắt và tai sẽ học cùng lúc." },
  { cat: "Kinh nghiệm", icon: "📱", title: "Đổi ngôn ngữ điện thoại", body: "Chuyển điện thoại hoặc một ứng dụng quen thuộc sang tiếng Tây Ban Nha. Bạn sẽ học được hàng chục từ thông dụng mà không tốn công." },
  { cat: "Kinh nghiệm", icon: "📓", title: "Viết nhật ký 3 câu", body: "Mỗi tối viết 3 câu đơn giản về ngày của bạn: Hoy estudio español. Estoy cansado. Mañana voy a trabajar. Viết đều sẽ biến kiến thức thụ động thành chủ động." },
  { cat: "Kinh nghiệm", icon: "🤝", title: "Tìm bạn trao đổi ngôn ngữ", body: "Nhiều người nói tiếng Tây Ban Nha muốn học tiếng Việt hoặc tiếng Anh. Trao đổi 30 phút mỗi tuần giúp bạn tự tin nói hơn bất kỳ ứng dụng nào." },
  { cat: "Kinh nghiệm", icon: "🙅", title: "Đừng sợ sai", body: "Người bản xứ rất thân thiện với người học. Nói sai mà được sửa là cách nhớ lâu nhất — im lặng mới là sai lầm lớn nhất." },
  { cat: "Kinh nghiệm", icon: "🌎", title: "Tây Ban Nha hay Mỹ Latinh?", body: "Hai vùng khác nhau ở một số từ và cách phát âm (z/c, vosotros), nhưng hiểu nhau hoàn toàn. Hãy chọn một giọng để luyện nói, và nghe cả hai." },
  { cat: "Tài nguyên", icon: "🎧", title: "Nghe podcast cho người học", body: "Tìm podcast dành cho người mới (ví dụ Coffee Break Spanish) — người dẫn nói chậm, giải thích rõ, rất hợp để nghe khi di chuyển." },
  { cat: "Tài nguyên", icon: "▶️", title: "Kênh video phỏng vấn đường phố", body: "Các kênh như Easy Spanish phỏng vấn người thật trên phố, có phụ đề song ngữ — giúp bạn quen tốc độ nói tự nhiên." },
  { cat: "Tài nguyên", icon: "🎓", title: "Đặt mục tiêu bằng chứng chỉ", body: "Chứng chỉ DELE của Instituto Cervantes có các cấp A1 → C2. Đăng ký một kỳ thi cụ thể là cách tạo động lực rất mạnh." }
];
