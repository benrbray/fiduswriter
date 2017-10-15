# -*- coding: utf-8 -*-
# Generated by Django 1.11.3 on 2017-08-10 09:56
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('document', '0025_auto_20170612_1123'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='document',
            name='comment_version',
        ),
        migrations.RemoveField(
            model_name='document',
            name='diff_version',
        ),
        migrations.RemoveField(
            model_name='document',
            name='metadata',
        ),
        migrations.AddField(
            model_name='document',
            name='doc_version',
            field=models.DecimalField(decimal_places=1, default=2.0, max_digits=3),
        ),
    ]