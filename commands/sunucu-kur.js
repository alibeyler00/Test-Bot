const { ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'sunucu-kur', // ← Burası önemli
  description: 'Emergency Hamburg RP sunucu yapısını oluşturur.',
  async execute(message, args) {
    if (!message.guild) return;
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) &&
        !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply('❌ Bu komutu kullanmak için **Yönetici** veya **Kanal Yönetimi** yetkisine sahip olmalısın.');
    }

    await message.reply('⏳ Sunucu yapısı oluşturuluyor...');

    const guild = message.guild;

    const createChannel = async (name, type, parentId = null) => {
      const options = {
        name,
        type,
      };
      if (parentId) options.parent = parentId;
      return await guild.channels.create(options);
    };

    const categories = {};

    categories.kayit = await createChannel('📋・kayıt-sistemleri', ChannelType.GuildCategory);
    await createChannel('🛂・kayıt-ol', ChannelType.GuildText, categories.kayit.id);
    await createChannel('✅・kayıt-onay', ChannelType.GuildText, categories.kayit.id);
    await createChannel('📜・kurallar', ChannelType.GuildText, categories.kayit.id);
    await createChannel('🎮・oyuncu-rolleri', ChannelType.GuildText, categories.kayit.id);
    await createChannel('👥・rol-seçimi', ChannelType.GuildText, categories.kayit.id);

    categories.duyuru = await createChannel('📢・duyuru-alanı', ChannelType.GuildCategory);
    await createChannel('📢・duyurular', ChannelType.GuildText, categories.duyuru.id);
    await createChannel('🛠️・bakım-duyuruları', ChannelType.GuildText, categories.duyuru.id);
    await createChannel('🎉・etkinlik-duyuruları', ChannelType.GuildText, categories.duyuru.id);
    await createChannel('🔔・ping-duyuruları', ChannelType.GuildText, categories.duyuru.id);
    await createChannel('🚨・acil-bildirim', ChannelType.GuildText, categories.duyuru.id);

    categories.yetkili = await createChannel('🧑‍💼・yetkili-alanı', ChannelType.GuildCategory);
    await createChannel('🧑‍⚖️・yetkili-sohbet', ChannelType.GuildText, categories.yetkili.id);
    await createChannel('📝・şikayet-kayıtları', ChannelType.GuildText, categories.yetkili.id);
    await createChannel('📂・kullanıcı-kayıtları', ChannelType.GuildText, categories.yetkili.id);
    await createChannel('🔧・yetkili-komut', ChannelType.GuildText, categories.yetkili.id);
    await createChannel('📊・raporlar', ChannelType.GuildText, categories.yetkili.id);

    categories.genel = await createChannel('💬・genel-sohbet', ChannelType.GuildCategory);
    await createChannel('💬・genel-sohbet', ChannelType.GuildText, categories.genel.id);
    await createChannel('🤖・komutlar', ChannelType.GuildText, categories.genel.id);
    await createChannel('🎮・oyun-içi-sohbet', ChannelType.GuildText, categories.genel.id);
    await createChannel('🖼️・medya-paylaşım', ChannelType.GuildText, categories.genel.id);
    await createChannel('🎧・müzik-komutları', ChannelType.GuildText, categories.genel.id);

    categories.rpPolis = await createChannel('👮・polis-rp', ChannelType.GuildCategory);
    await createChannel('🚔・polis-sohbet', ChannelType.GuildText, categories.rpPolis.id);
    await createChannel('📻・radyo-kanalı', ChannelType.GuildText, categories.rpPolis.id);
    await createChannel('🧾・tutanaklar', ChannelType.GuildText, categories.rpPolis.id);

    categories.rpItfaiye = await createChannel('🧑‍🚒・itfaiye-rp', ChannelType.GuildCategory);
    await createChannel('🚒・itfaiye-sohbet', ChannelType.GuildText, categories.rpItfaiye.id);
    await createChannel('🔥・yangın-ihbarları', ChannelType.GuildText, categories.rpItfaiye.id);
    await createChannel('🪓・ekipman-emri', ChannelType.GuildText, categories.rpItfaiye.id);

    categories.rpSaglik = await createChannel('🚑・sağlık-rp', ChannelType.GuildCategory);
    await createChannel('🚑・ambulans-sohbet', ChannelType.GuildText, categories.rpSaglik.id);
    await createChannel('🩺・hasta-kayıtları', ChannelType.GuildText, categories.rpSaglik.id);
    await createChannel('💊・eczane-raporu', ChannelType.GuildText, categories.rpSaglik.id);

    categories.rpSivil = await createChannel('🚗・sivil-rp', ChannelType.GuildCategory);
    await createChannel('🏠・ev-sohbeti', ChannelType.GuildText, categories.rpSivil.id);
    await createChannel('🚙・araç-satın-al', ChannelType.GuildText, categories.rpSivil.id);
    await createChannel('🛒・alışveriş-merkezi', ChannelType.GuildText, categories.rpSivil.id);

    await message.reply('✅ Emergency Hamburg RP sunucu yapısı başarıyla oluşturuldu!');
  },
};
