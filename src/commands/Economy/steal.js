const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('steal')
        .setDescription('Προσπάθησε να κλέψεις χρήματα από έναν χρήστη')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Ο χρήστης που θέλεις να ληστέψεις')
                .setRequired(true)),

    async execute(interaction, db) {
        const target = interaction.options.getUser('target');
        const author = interaction.user;

        if (target.id === author.id) {
            return interaction.reply({ content: 'Δεν μπορείς να κλέψεις τον εαυτό σου!', ephemeral: true });
        }

        if (target.bot) {
            return interaction.reply({ content: 'Δεν μπορείς να ληστέψεις ένα bot!', ephemeral: true });
        }

        const authorBalance = await db.get(`money_${author.id}`) || 0;
        const targetBalance = await db.get(`money_${target.id}`) || 0;

        if (targetBalance < 100) {
            return interaction.reply({ content: 'Ο στόχος σου δεν έχει αρκετά χρήματα για να τον ληστέψεις (τουλάχιστον 100).', ephemeral: true });
        }

        const success = Math.random() < 0.5;

        if (success) {
            const amountToSteal = Math.floor(targetBalance * 0.1);
            await db.subtract(`money_${target.id}`, amountToSteal);
            await db.add(`money_${author.id}`, amountToSteal);
            await interaction.reply(`Επιτυχία! Έκλεψες ${amountToSteal} νομίσματα από τον ${target.username}!`);
        } else {
            const penalty = 50;
            await db.subtract(`money_${author.id}`, penalty);
            await interaction.reply(`Αποτυχία! Σε έπιασαν και αναγκάστηκες να πληρώσεις πρόστιμο ${penalty} νομισμάτων.`);
        }
    }
};
