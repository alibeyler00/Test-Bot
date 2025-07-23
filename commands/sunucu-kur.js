const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sunucu-kur')
    .setDescription('Emergency Hamburg RP sunucu yapısını oluşturur.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    await interaction.reply({ content: '⏳ Sunucu yapısı oluşturuluyor...', ephemeral: true });

    const guild = interaction.guild;

    // Temiz isim - kanal oluşturucu
    const createChannel = async (name, type, parent = null) => {
      return await guild.channels.create({
        name,
        type,
        parent
      });
    };

    const categories = {};

    // 📋・Kayıt Sistemleri
    categories.kayit = await guild.channels.create({
      name: '📋・kayıt-sistemleri',
      type: 4,
    });
    await createChannel('🛂・kayıt-ol', 0, categories.kayit.id);
    await createChannel('✅・kayıt-onay', 0, categories.kayit.id);
    await createChannel('📜・kurallar', 0, categories.kayit.id);
    await createChannel('🎮・oyuncu-rolleri', 0, categories.kayit.id);
    await createChannel('👥・rol-seçimi', 0, categories.kayit.id);

    // 📢・Duyuru Alanı
    categories.duyuru = await guild.channels.create({
      name: '📢・duyuru-alanı',
      type: 4,
    });
    await createChannel('📢・duyurular', 0, categories.duyuru.id);
    await createChannel('🛠️・bakım-duyuruları', 0, categories.duyuru.id);
    await createChannel('🎉・etkinlik-duyuruları', 0, categories.duyuru.id);
    await createChannel('🔔・ping-duyuruları', 0, categories.duyuru.id);
    await createChannel('🚨・acil-bildirim', 0, categories.duyuru.id);

    // 🧑‍💼・Yetkili Alanı
    categories.yetkili = await guild.channels.create({
      name: '🧑‍💼・yetkili-alanı',
      type: 4,
    });
    await createChannel('🧑‍⚖️・yetkili-sohbet', 0, categories.yetkili.id);
    await createChannel('📝・şikayet-kayıtları', 0, categories.yetkili.id);
    await createChannel('📂・kullanıcı-kayıtları', 0, categories.yetkili.id);
    await createChannel('🔧・yetkili-komut', 0, categories.yetkili.id);
    await createChannel('📊・raporlar', 0, categories.yetkili.id);

    // 💬・Genel Sohbet
    categories.genel = await guild.channels.create({
      name: '💬・genel-sohbet',
      type: 4,
    });
    await createChannel('💬・genel-sohbet', 0, categories.genel.id);
    await createChannel('🤖・komutlar', 0, categories.genel.id);
    await createChannel('🎮・oyun-içi-sohbet', 0, categories.genel.id);
    await createChannel('🖼️・medya-paylaşım', 0, categories.genel.id);
    await createChannel('🎧・müzik-komutları', 0, categories.genel.id);

    // 🚓・RP Birimleri
    categories.rpPolis = await guild.channels.create({ name: '👮・polis-rp', type: 4 });
    await createChannel('🚔・polis-sohbet', 0, categories.rpPolis.id);
    await createChannel('📻・radyo-kanalı', 0, categories.rpPolis.id);
    await createChannel('🧾・tutanaklar', 0, categories.rpPolis.id);

    categories.rpItfaiye = await guild.channels.create({ name: '🧑‍🚒・itfaiye-rp', type: 4 });
    await createChannel('🚒・itfaiye-sohbet', 0, categories.rpItfaiye.id);
    await createChannel('🔥・yangın-ihbarları', 0, categories.rpItfaiye.id);
    await createChannel('🪓・ekipman-emri', 0, categories.rpItfaiye.id);

    categories.rpSaglik = await guild.channels.create({ name: '🚑・sağlık-rp', type: 4 });
    await createChannel('🚑・ambulans-sohbet', 0, categories.rpSaglik.id);
    await createChannel('🩺・hasta-kayıtları', 0, categories.rpSaglik.id);
    await createChannel('💊・eczane-raporu', 0, categories.rpSaglik.id);

    categories.rpSivil = await guild.channels.create({ name: '🚗・sivil-rp', type: 4 });
    await createChannel('🏠・ev-sohbeti', 0, categories.rpSivil.id);
    await createChannel('🚙・araç-satın-al', 0, categories.rpSivil.id);
    await createChannel('🛒・alışveriş-merkezi', 0, categories.rpSivil.id);

    await interaction.editReply({ content: '✅ Emergency Hamburg RP sunucu yapısı başarıyla oluşturuldu!' });
  },
};
