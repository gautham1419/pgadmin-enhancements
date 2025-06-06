##########################################################################
#
# pgAdmin 4 - PostgreSQL Tools
#
# Copyright (C) 2013 - 2025, The pgAdmin Development Team
# This software is released under the PostgreSQL Licence
#
##########################################################################

import os
import json
from unittest.mock import patch
from pgadmin.utils.route import BaseTestGenerator
from regression.python_test_utils import test_utils as utils
from ...tests import utils as job_scheduler_utils
from pgadmin.browser.server_groups.servers.databases.tests import \
    utils as database_utils


# Load test data from json file.
CURRENT_PATH = os.path.dirname(os.path.realpath(__file__))
with open(CURRENT_PATH + "/dbms_jobs_test_data.json") as data_file:
    test_cases = json.load(data_file)


class DBMSAddJobTestCase(BaseTestGenerator):
    """This class will test the add job in the DBMS Job API"""
    scenarios = utils.generate_scenarios("dbms_create_job",
                                         test_cases)

    def setUp(self):
        super().setUp()
        # Load test data
        self.data = self.test_data

        if not job_scheduler_utils.is_supported_version(self):
            self.skipTest(job_scheduler_utils.SKIP_MSG)

        # Create db
        self.db_name, self.db_id = job_scheduler_utils.create_test_database(
            self)
        db_con = database_utils.connect_database(self,
                                                 utils.SERVER_GROUP,
                                                 self.server_id,
                                                 self.db_id)
        if db_con["info"] != "Database connected.":
            raise Exception("Could not connect to database.")

        # Create extension required for job scheduler
        job_scheduler_utils.create_job_scheduler_extensions(self)

        if not job_scheduler_utils.is_dbms_job_scheduler_present(self):
            self.skipTest(job_scheduler_utils.SKIP_MSG_EXTENSION)

        # Create job schedule
        job_scheduler_utils.create_dbms_schedule(self, 'yearly_sch')
        job_scheduler_utils.create_dbms_program(self, 'prg_with_psql')
        job_scheduler_utils.create_dbms_program(
            self,'prg_with_proc_noargs', with_proc=True,
            proc_name='public.test_proc_without_args()')
        job_scheduler_utils.create_dbms_program(
            self,'prg_with_proc_args', with_proc=True,
            proc_name='public.test_proc_with_args(IN salary bigint DEFAULT '
                      '10000, IN name character varying)')

    def runTest(self):
        """ This function will add DBMS Job under test database. """
        if self.is_positive_test:
            response = job_scheduler_utils.api_create(self)

            # Assert response
            utils.assert_status_code(self, response)

            # Verify in backend
            response_data = json.loads(response.data)
            self.jobs_id = response_data['node']['_id']
            jobs_name = response_data['node']['label']
            is_present = job_scheduler_utils.verify_dbms_job(
                self, jobs_name)
            self.assertTrue(
                is_present,"DBMS job was not created successfully.")
        else:
            if self.mocking_required:
                with patch(self.mock_data["function_name"],
                           side_effect=eval(self.mock_data["return_value"])):
                    response = job_scheduler_utils.api_create(self)

                    # Assert response
                    utils.assert_status_code(self, response)
                    utils.assert_error_message(self, response)

    def tearDown(self):
        """This function will do the cleanup task."""
        job_scheduler_utils.clean_up(self)
