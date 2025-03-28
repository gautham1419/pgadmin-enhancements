
"""empty message

Revision ID: 210b7268fd03
Revises: e982c040d9b5
Create Date: 2025-03-28 12:25:33.820906

"""
from pgadmin.model import db


# revision identifiers, used by Alembic.
revision = '210b7268fd03'
down_revision = 'e982c040d9b5'
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    # pgAdmin only upgrades, downgrade not implemented.
    pass
