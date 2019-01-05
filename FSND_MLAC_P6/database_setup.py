#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


# User info
class User(Base):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True)
    name = Column(String(250), nullable=False)
    email = Column(String(250), nullable=False)
    image = Column(String(250))
    provider = Column(String(250))


# spare parts Database


class SpareParts(Base):
    __tablename__ = "spare"

    id = Column(Integer, primary_key=True)
    spare = Column(String(250), nullable=False)
    manufacturer = Column(String(250), nullable=False)
    category = Column(String(450), nullable=False)
    unit = Column(String(250), nullable=False)
    description = Column(String(), nullable=False)
    user_id = Column(Integer, ForeignKey('user.id'))
    user = relationship(User)

    @property
    def serialize(self):
        return {
            'id': self.id,
            'Name': self.spare,
            'Manufacturer': self.manufacturer,
            'Category': self.category,
            'unit': self.unit,
            'Description': self.description
        }


engine = create_engine('postgresql://spareparts:spareparts@localhost/spareparts')
Base.metadata.create_all(engine)
